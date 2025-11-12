import { NextRequest, NextResponse } from "next/server";

// GET - Fetch all challenges or a specific challenge
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const difficulty = searchParams.get("difficulty");
    const category = searchParams.get("category");
    const limit = parseInt(searchParams.get("limit") || "10");
    const offset = parseInt(searchParams.get("offset") || "0");

    if (id) {
      // Fetch specific challenge
      // For now, return sample data since we don't have DB schema
      return NextResponse.json(getSampleChallenge(id));
    }

    // Fetch challenges with filters
    const challenges = getSampleChallenges(difficulty, category, limit, offset);

    return NextResponse.json({
      challenges,
      total: challenges.length,
      hasMore: false,
    });
  } catch (error) {
    console.error("Error fetching challenges:", error);
    return NextResponse.json(
      { error: "Failed to fetch challenges" },
      { status: 500 }
    );
  }
}

// POST - Create a new challenge (admin only)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // TODO: Add authentication check for admin users
    // const session = await getServerSession();
    // if (!session || session.user.role !== 'ADMIN') {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const {
      title,
      difficulty,
      description,
      constraints,
      examples,
      testCases,
      timeLimit,
      memoryLimit,
      category,
      tags,
    } = body;

    // Validate required fields
    if (!title || !difficulty || !description || !testCases) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // TODO: Save to database
    // const challenge = await prisma.codeChallenge.create({
    //   data: {
    //     title,
    //     difficulty,
    //     description,
    //     constraints,
    //     examples,
    //     testCases,
    //     timeLimit,
    //     memoryLimit,
    //     category,
    //     tags,
    //   },
    // });

    const challenge = {
      id: Date.now().toString(),
      title,
      difficulty,
      description,
      constraints,
      examples,
      testCases,
      timeLimit,
      memoryLimit,
      category,
      tags,
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json(challenge, { status: 201 });
  } catch (error) {
    console.error("Error creating challenge:", error);
    return NextResponse.json(
      { error: "Failed to create challenge" },
      { status: 500 }
    );
  }
}

// Sample challenges for development
function getSampleChallenges(
  difficulty?: string | null,
  category?: string | null,
  limit = 10,
  offset = 0
) {
  const challenges = [
    {
      id: "1",
      title: "Two Sum",
      difficulty: "Easy",
      description: "Find two numbers that add up to a target value",
      category: "Arrays",
      tags: ["arrays", "hash-map"],
      acceptanceRate: 48.2,
      submissions: 5234,
    },
    {
      id: "2",
      title: "Reverse Linked List",
      difficulty: "Easy",
      description: "Reverse a singly linked list",
      category: "Linked Lists",
      tags: ["linked-list", "recursion"],
      acceptanceRate: 72.1,
      submissions: 3421,
    },
    {
      id: "3",
      title: "Binary Tree Level Order Traversal",
      difficulty: "Medium",
      description: "Return the level order traversal of a binary tree",
      category: "Trees",
      tags: ["tree", "bfs", "queue"],
      acceptanceRate: 61.5,
      submissions: 2890,
    },
    {
      id: "4",
      title: "Longest Substring Without Repeating Characters",
      difficulty: "Medium",
      description: "Find the length of the longest substring without repeating characters",
      category: "Strings",
      tags: ["string", "sliding-window", "hash-map"],
      acceptanceRate: 34.8,
      submissions: 4123,
    },
    {
      id: "5",
      title: "Median of Two Sorted Arrays",
      difficulty: "Hard",
      description: "Find the median of two sorted arrays",
      category: "Arrays",
      tags: ["array", "binary-search", "divide-and-conquer"],
      acceptanceRate: 31.7,
      submissions: 1567,
    },
  ];

  let filtered = challenges;

  if (difficulty) {
    filtered = filtered.filter(
      (c) => c.difficulty.toLowerCase() === difficulty.toLowerCase()
    );
  }

  if (category) {
    filtered = filtered.filter(
      (c) => c.category.toLowerCase() === category.toLowerCase()
    );
  }

  return filtered.slice(offset, offset + limit);
}

function getSampleChallenge(id: string) {
  const challenges: Record<string, any> = {
    "1": {
      id: "1",
      title: "Two Sum",
      difficulty: "Easy",
      description: `Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

You can return the answer in any order.`,
      constraints: [
        "2 ≤ nums.length ≤ 10⁴",
        "-10⁹ ≤ nums[i] ≤ 10⁹",
        "-10⁹ ≤ target ≤ 10⁹",
        "Only one valid answer exists.",
      ],
      examples: [
        {
          input: "nums = [2,7,11,15], target = 9",
          output: "[0,1]",
          explanation: "Because nums[0] + nums[1] == 9, we return [0, 1].",
        },
        {
          input: "nums = [3,2,4], target = 6",
          output: "[1,2]",
          explanation: "Because nums[1] + nums[2] == 6, we return [1, 2].",
        },
      ],
      testCases: [
        { id: "1", input: "[2,7,11,15], 9", expectedOutput: "[0,1]" },
        { id: "2", input: "[3,2,4], 6", expectedOutput: "[1,2]" },
        { id: "3", input: "[3,3], 6", expectedOutput: "[0,1]" },
        { id: "4", input: "[1,2,3,4,5], 8", expectedOutput: "[2,4]" },
        { id: "5", input: "[-1,-2,-3,-4,-5], -8", expectedOutput: "[2,4]" },
      ],
      timeLimit: 1000,
      memoryLimit: 256,
      category: "Arrays",
      tags: ["arrays", "hash-map"],
      hints: [
        "Consider using a hash map to store values and their indices as you iterate through the array.",
        "For each number, check if its complement (target - current number) exists in your hash map.",
      ],
      starterCode: {
        javascript: `function twoSum(nums, target) {
    // Your solution here
    
}`,
        python: `def two_sum(nums, target):
    # Your solution here
    pass`,
        java: `public class Solution {
    public int[] twoSum(int[] nums, int target) {
        // Your solution here
        
    }
}`,
        cpp: `#include <vector>
using namespace std;

class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        // Your solution here
        
    }
};`,
        typescript: `function twoSum(nums: number[], target: number): number[] {
    // Your solution here
    
}`,
        go: `func twoSum(nums []int, target int) []int {
    // Your solution here
    
}`,
      },
    },
  };

  return challenges[id] || challenges["1"];
}
