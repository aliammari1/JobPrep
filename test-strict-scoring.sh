#!/bin/bash

echo "🧪 Testing STRICT scoring system..."
echo ""

# Test 1: Bad answer (just "yes")
echo "📝 Test 1: Answer 'yes' to a complex question (should get score 0-2)"
curl -s -X POST http://localhost:3000/api/evaluate-answer \
  -H "Content-Type: application/json" \
  -d '{
    "question": "Explain the difference between REST and GraphQL APIs",
    "idealAnswer": "REST uses multiple endpoints for different resources with standard HTTP methods (GET, POST, PUT, DELETE), while GraphQL uses a single endpoint and allows clients to request exactly the data they need using a query language. GraphQL reduces over-fetching and under-fetching of data, provides strong typing, and enables real-time updates through subscriptions.",
    "userAnswer": "yes",
    "evaluationCriteria": ["Technical accuracy", "Completeness", "Clarity"]
  }' | python3 -c "import sys, json; data=json.load(sys.stdin); print(f\"Score: {data['score']}/10\nFeedback: {data['feedback']}\n\")"

echo ""
echo "---"
echo ""

# Test 2: Good answer (should get 7-9)
echo "📝 Test 2: Good detailed answer (should get score 7-9)"
curl -s -X POST http://localhost:3000/api/evaluate-answer \
  -H "Content-Type: application/json" \
  -d '{
    "question": "Explain the difference between REST and GraphQL APIs",
    "idealAnswer": "REST uses multiple endpoints for different resources with standard HTTP methods (GET, POST, PUT, DELETE), while GraphQL uses a single endpoint and allows clients to request exactly the data they need using a query language. GraphQL reduces over-fetching and under-fetching of data, provides strong typing, and enables real-time updates through subscriptions.",
    "userAnswer": "REST APIs use multiple endpoints for different resources like /users or /posts, and use HTTP methods like GET and POST. GraphQL uses just one endpoint and you write queries to get exactly what you need. GraphQL is better at avoiding getting too much or too little data, has type checking, and supports real-time updates.",
    "evaluationCriteria": ["Technical accuracy", "Completeness", "Clarity"]
  }' | python3 -c "import sys, json; data=json.load(sys.stdin); print(f\"Score: {data['score']}/10\nFeedback: {data['feedback']}\n\")"

echo ""
echo "---"
echo ""

# Test 3: Partially correct answer (should get 4-6)
echo "📝 Test 3: Partially correct answer (should get score 4-6)"
curl -s -X POST http://localhost:3000/api/evaluate-answer \
  -H "Content-Type: application/json" \
  -d '{
    "question": "Explain the difference between REST and GraphQL APIs",
    "idealAnswer": "REST uses multiple endpoints for different resources with standard HTTP methods (GET, POST, PUT, DELETE), while GraphQL uses a single endpoint and allows clients to request exactly the data they need using a query language. GraphQL reduces over-fetching and under-fetching of data, provides strong typing, and enables real-time updates through subscriptions.",
    "userAnswer": "REST has many endpoints and GraphQL has one endpoint.",
    "evaluationCriteria": ["Technical accuracy", "Completeness", "Clarity"]
  }' | python3 -c "import sys, json; data=json.load(sys.stdin); print(f\"Score: {data['score']}/10\nFeedback: {data['feedback']}\n\")"

echo ""
echo "✅ Test complete!"
