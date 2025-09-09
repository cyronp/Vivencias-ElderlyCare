from fastapi import *
import sqlite3

conn = sqlite3.connect('elderly.db')

app = FastAPI()
cursor = conn.cursor()


@app.get("/")
def add_elderly():
  print("a")