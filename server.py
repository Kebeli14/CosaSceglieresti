from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime
from emergentintegrations.llm.chat import LlmChat, UserMessage
from bson import ObjectId


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Define Models
class Question(BaseModel):
    id: Optional[str] = Field(default=None, alias="_id")
    category: str
    optionA: str
    optionB: str
    votesA: int = 0
    votesB: int = 0
    createdBy: str = "admin"  # "admin" or "ai" or "user"
    createdAt: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True


class QuestionCreate(BaseModel):
    category: str
    optionA: str
    optionB: str


class ChoiceRequest(BaseModel):
    questionId: str
    choice: str  # "A" or "B"
    userId: Optional[str] = None


class StatsResponse(BaseModel):
    questionId: str
    votesA: int
    votesB: int
    percentageA: float
    percentageB: float


class GenerateQuestionRequest(BaseModel):
    category: str


# Add your routes to the router instead of directly to app
@api_router.get("/")
async def root():
    return {"message": "Cosa Sceglieresti API"}


# Get questions by category
@api_router.get("/questions", response_model=List[Question])
async def get_questions(category: str = "random"):
    try:
        if category.lower() == "random":
            # Get random mix from all categories
            questions = await db.questions.aggregate([
                {"$sample": {"size": 10}}
            ]).to_list(10)
        else:
            questions = await db.questions.find({"category": category}).to_list(100)
        
        # Convert _id to string
        for q in questions:
            q["_id"] = str(q["_id"])
        
        return [Question(**q) for q in questions]
    except Exception as e:
        logging.error(f"Error fetching questions: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# Create a new question
@api_router.post("/questions", response_model=Question)
async def create_question(question: QuestionCreate):
    try:
        question_dict = question.dict()
        question_obj = Question(**question_dict)
        result = await db.questions.insert_one(question_obj.dict(by_alias=True, exclude={"id"}))
        question_obj.id = str(result.inserted_id)
        return question_obj
    except Exception as e:
        logging.error(f"Error creating question: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# Record a choice and update stats
@api_router.post("/choice", response_model=StatsResponse)
async def record_choice(choice_req: ChoiceRequest):
    try:
        # Update vote count
        update_field = "votesA" if choice_req.choice == "A" else "votesB"
        
        result = await db.questions.find_one_and_update(
            {"_id": ObjectId(choice_req.questionId)},
            {"$inc": {update_field: 1}},
            return_document=True
        )
        
        if not result:
            raise HTTPException(status_code=404, detail="Question not found")
        
        # Record user choice (optional tracking)
        if choice_req.userId:
            await db.user_choices.insert_one({
                "userId": choice_req.userId,
                "questionId": choice_req.questionId,
                "choice": choice_req.choice,
                "timestamp": datetime.utcnow()
            })
        
        # Calculate percentages
        total_votes = result["votesA"] + result["votesB"]
        percentage_a = (result["votesA"] / total_votes * 100) if total_votes > 0 else 50
        percentage_b = (result["votesB"] / total_votes * 100) if total_votes > 0 else 50
        
        return StatsResponse(
            questionId=choice_req.questionId,
            votesA=result["votesA"],
            votesB=result["votesB"],
            percentageA=round(percentage_a, 1),
            percentageB=round(percentage_b, 1)
        )
    except Exception as e:
        logging.error(f"Error recording choice: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# Get stats for a question
@api_router.get("/stats/{question_id}", response_model=StatsResponse)
async def get_stats(question_id: str):
    try:
        question = await db.questions.find_one({"_id": ObjectId(question_id)})
        
        if not question:
            raise HTTPException(status_code=404, detail="Question not found")
        
        total_votes = question["votesA"] + question["votesB"]
        percentage_a = (question["votesA"] / total_votes * 100) if total_votes > 0 else 50
        percentage_b = (question["votesB"] / total_votes * 100) if total_votes > 0 else 50
        
        return StatsResponse(
            questionId=question_id,
            votesA=question["votesA"],
            votesB=question["votesB"],
            percentageA=round(percentage_a, 1),
            percentageB=round(percentage_b, 1)
        )
    except Exception as e:
        logging.error(f"Error getting stats: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# Generate a new question using AI
@api_router.post("/generate-question", response_model=Question)
async def generate_question(request: GenerateQuestionRequest):
    try:
        # Create category-specific prompts
        prompts = {
            "storico": "Genera una domanda 'Preferiresti' in stile storico. Deve essere una scelta difficile tra due scenari storici o epoche. Rispondi SOLO con questo formato JSON: {\"optionA\": \"...\", \"optionB\": \"...\"}",
            "calcio": "Genera una domanda 'Preferiresti' sul calcio. Deve essere una scelta difficile tra due scenari calcistici (carriera, trofei, momenti epici). Rispondi SOLO con questo formato JSON: {\"optionA\": \"...\", \"optionB\": \"...\"}",
            "basket": "Genera una domanda 'Preferiresti' sull'NBA/basket. Deve essere una scelta difficile tra due scenari (carriera, campionati, leggende). Rispondi SOLO con questo formato JSON: {\"optionA\": \"...\", \"optionB\": \"...\"}",
            "religione": "Genera una domanda 'Preferiresti' filosofica/religiosa. Deve essere una scelta profonda su fede, spiritualità o esistenza. Rispondi SOLO con questo formato JSON: {\"optionA\": \"...\", \"optionB\": \"...\"}",
            "random": "Genera una domanda 'Preferiresti' assurda e divertente su qualsiasi tema. Rispondi SOLO con questo formato JSON: {\"optionA\": \"...\", \"optionB\": \"...\"}"
        }
        
        category = request.category.lower()
        prompt = prompts.get(category, prompts["random"])
        
        # Call LLM
        chat = LlmChat(
            api_key=os.environ.get("EMERGENT_LLM_KEY"),
            session_id=f"question-gen-{uuid.uuid4()}",
            system_message="Sei un creatore esperto di domande 'Would You Rather' in italiano. Le tue domande sono creative, coinvolgenti e fanno riflettere."
        ).with_model("openai", "gpt-5.2")
        
        user_message = UserMessage(text=prompt)
        response = await chat.send_message(user_message)
        
        # Parse response (expecting JSON format)
        import json
        try:
            # Extract JSON from response
            response_text = response.strip()
            if "```json" in response_text:
                response_text = response_text.split("```json")[1].split("```")[0].strip()
            elif "```" in response_text:
                response_text = response_text.split("```")[1].split("```")[0].strip()
            
            data = json.loads(response_text)
            option_a = data.get("optionA", "")
            option_b = data.get("optionB", "")
        except:
            # Fallback parsing
            lines = response.strip().split("\n")
            option_a = lines[0] if len(lines) > 0 else "Opzione A"
            option_b = lines[1] if len(lines) > 1 else "Opzione B"
        
        # Create and save the question
        question = Question(
            category=category,
            optionA=option_a,
            optionB=option_b,
            createdBy="ai"
        )
        
        result = await db.questions.insert_one(question.dict(by_alias=True, exclude={"id"}))
        question.id = str(result.inserted_id)
        
        return question
        
    except Exception as e:
        logging.error(f"Error generating question: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# Seed initial questions
@api_router.post("/seed")
async def seed_questions():
    try:
        # Check if already seeded
        count = await db.questions.count_documents({})
        if count > 0:
            return {"message": "Database already has questions", "count": count}
        
        initial_questions = [
            # Storico
            {
                "category": "storico",
                "optionA": "Vivere nell'Impero Romano al suo apice",
                "optionB": "Vivere nell'Antico Egitto durante la costruzione delle piramidi",
                "votesA": 120,
                "votesB": 95,
                "createdBy": "admin"
            },
            {
                "category": "storico",
                "optionA": "Essere un cavaliere medievale",
                "optionB": "Essere un samurai giapponese",
                "votesA": 87,
                "votesB": 134,
                "createdBy": "admin"
            },
            {
                "category": "storico",
                "optionA": "Partecipare alla rivoluzione francese",
                "optionB": "Esplorare il Nuovo Mondo con Colombo",
                "votesA": 102,
                "votesB": 78,
                "createdBy": "admin"
            },
            # Calcio
            {
                "category": "calcio",
                "optionA": "Vincere la Champions da panchinaro",
                "optionB": "Perdere la finale da protagonista assoluto",
                "votesA": 156,
                "votesB": 210,
                "createdBy": "admin"
            },
            {
                "category": "calcio",
                "optionA": "Giocare 15 anni in Serie B da capitano",
                "optionB": "Giocare 2 anni in Serie A poi finire la carriera",
                "votesA": 98,
                "votesB": 167,
                "createdBy": "admin"
            },
            {
                "category": "calcio",
                "optionA": "Vincere il Pallone d'Oro senza mai vincere un trofeo",
                "optionB": "Vincere tutto ma non essere mai nei top 10",
                "votesA": 201,
                "votesB": 112,
                "createdBy": "admin"
            },
            # Basket
            {
                "category": "basket",
                "optionA": "10 anni da role player in NBA",
                "optionB": "1 anno da MVP poi finire in Europa",
                "votesA": 145,
                "votesB": 189,
                "createdBy": "admin"
            },
            {
                "category": "basket",
                "optionA": "Vincere 5 anelli da sesto uomo",
                "optionB": "0 anelli ma 10 convocazioni All-Star",
                "votesA": 167,
                "votesB": 98,
                "createdBy": "admin"
            },
            {
                "category": "basket",
                "optionA": "Giocare con Michael Jordan nei Bulls",
                "optionB": "Essere compagno di squadra di LeBron",
                "votesA": 234,
                "votesB": 143,
                "createdBy": "admin"
            },
            # Religione
            {
                "category": "religione",
                "optionA": "Parlare direttamente con una divinità",
                "optionB": "Ricevere una prova fisica e tangibile del soprannaturale",
                "votesA": 189,
                "votesB": 156,
                "createdBy": "admin"
            },
            {
                "category": "religione",
                "optionA": "Conoscere il senso ultimo della vita",
                "optionB": "Sapere con certezza cosa c'è dopo la morte",
                "votesA": 198,
                "votesB": 187,
                "createdBy": "admin"
            },
            {
                "category": "religione",
                "optionA": "Vivere in un mondo con religioni diverse ma in armonia",
                "optionB": "Vivere in un mondo con una sola religione universale",
                "votesA": 267,
                "votesB": 89,
                "createdBy": "admin"
            },
            # Random
            {
                "category": "random",
                "optionA": "Avere sempre la canzone giusta in mente al momento giusto",
                "optionB": "Non dover mai più aspettare in fila",
                "votesA": 134,
                "votesB": 201,
                "createdBy": "admin"
            },
            {
                "category": "random",
                "optionA": "Parlare con gli animali",
                "optionB": "Parlare tutte le lingue del mondo",
                "votesA": 298,
                "votesB": 156,
                "createdBy": "admin"
            },
            {
                "category": "random",
                "optionA": "Vivere senza internet per un anno con 1 milione di euro",
                "optionB": "Vivere con internet ma guadagnare solo 1000 euro al mese",
                "votesA": 312,
                "votesB": 87,
                "createdBy": "admin"
            }
        ]
        
        for q in initial_questions:
            q["createdAt"] = datetime.utcnow()
        
        result = await db.questions.insert_many(initial_questions)
        
        return {
            "message": "Database seeded successfully",
            "inserted": len(result.inserted_ids)
        }
        
    except Exception as e:
        logging.error(f"Error seeding questions: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()