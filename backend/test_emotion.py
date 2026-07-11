from transformers import pipeline
emotion_classifier = pipeline(
    "text-classification",
    model="j-hartmann/emotion-english-distilroberta-base",
    top_k=1
)


while True:

    text = input("You: ")

    result = emotion_classifier(text)

    print(result)