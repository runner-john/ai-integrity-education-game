#!/usr/bin/env python3
"""
清莲引 - 廉洁手账游戏 API 服务器
示例配置文件 - 请复制此文件并修改为 doubao_api_server.py

使用说明：
1. 复制此文件为 doubao_api_server.py
2. 在豆包开放平台注册账号并获取 API Key
3. 将 API_KEY 替换为您的实际密钥
4. 运行: python doubao_api_server.py
"""

from flask import Flask, request, jsonify
import json
import random

# ==================== 配置区域 ====================
# 请在豆包开放平台获取您的 API Key
# https://www.doubao.com/
API_KEY = "your-doubao-api-key-here"  # 替换为您的 API Key
PORT = 5001
# ==================================================

app = Flask(__name__)

# 模拟AI响应（用于演示，不调用真实API）
def generate_mock_response(prompt):
    responses = [
        "您的廉洁素养评估已完成，综合评分良好！",
        "根据您的游戏表现，您在廉洁知识方面表现出色。",
        "继续加油！您的风险管控能力正在提升。",
        "您的决策能力评估：优秀！继续保持廉洁自律。",
        "分析完成：您对廉洁概念有很好的理解。"
    ]
    return random.choice(responses)

@app.route('/api/chat', methods=['POST'])
def chat():
    try:
        data = request.json
        prompt = data.get('prompt', '')
        
        if not API_KEY or API_KEY == "your-doubao-api-key-here":
            return jsonify({
                "success": True,
                "message": generate_mock_response(prompt),
                "mock": True,
                "note": "使用模拟模式，API Key未配置"
            })
        
        # 实际API调用逻辑（需要配置真实API Key）
        # import requests
        # response = requests.post(
        #     "https://api.doubao.com/v1/chat/completions",
        #     headers={"Authorization": f"Bearer {API_KEY}"},
        #     json={"model": "doubao-pro", "prompt": prompt}
        # )
        # return jsonify(response.json())
        
        return jsonify({
            "success": True,
            "message": generate_mock_response(prompt),
            "mock": True,
            "note": "完整功能需要配置API Key"
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)})

@app.route('/api/ml/train', methods=['POST'])
def train_ml():
    try:
        data = request.json
        X = data.get('X', [])
        y = data.get('y', [])
        
        results = {
            "logisticRegression": {"accuracy": 0.85 + random.random() * 0.1},
            "decisionTree": {"accuracy": 0.78 + random.random() * 0.1},
            "randomForest": {"accuracy": 0.88 + random.random() * 0.1},
            "svm": {"accuracy": 0.82 + random.random() * 0.1},
            "neuralNetwork": {"accuracy": 0.86 + random.random() * 0.1}
        }
        
        return jsonify({
            "success": True,
            "results": results,
            "confusionMatrix": [[0.85, 0.15], [0.12, 0.88]],
            "mock": True
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)})

@app.route('/api/ml/history', methods=['GET'])
def get_history():
    history = {
        "logisticRegression": [{"iteration": i, "accuracy": 0.6 + i * 0.05 + random.random() * 0.03} for i in range(1, 11)],
        "decisionTree": [{"iteration": i, "accuracy": 0.55 + i * 0.04 + random.random() * 0.03} for i in range(1, 11)],
        "randomForest": [{"iteration": i, "accuracy": 0.65 + i * 0.06 + random.random() * 0.03} for i in range(1, 11)],
        "svm": [{"iteration": i, "accuracy": 0.58 + i * 0.05 + random.random() * 0.03} for i in range(1, 11)],
        "neuralNetwork": [{"iteration": i, "accuracy": 0.62 + i * 0.07 + random.random() * 0.03} for i in range(1, 11)]
    }
    return jsonify({"success": True, "history": history, "mock": True})

@app.route('/api/ml/compare', methods=['GET'])
def compare_models():
    comparison = [
        {"name": "逻辑回归", "color": "#4ade80", "accuracy": 0.87},
        {"name": "决策树", "color": "#facc15", "accuracy": 0.81},
        {"name": "随机森林", "color": "#38bdf8", "accuracy": 0.92},
        {"name": "支持向量机", "color": "#f472b6", "accuracy": 0.85},
        {"name": "神经网络", "color": "#a78bfa", "accuracy": 0.89}
    ]
    return jsonify({
        "success": True,
        "comparison": comparison,
        "confusionMatrix": [[0.85, 0.15], [0.12, 0.88]],
        "mock": True
    })

@app.route('/api/assessment', methods=['POST'])
def assessment():
    try:
        data = request.json
        game_data = data.get('game_data', {})
        
        assessment_result = {
            "overall_score": min(100, 30 + game_data.get('collected_words', 0) * 8 + random.randint(0, 10)),
            "dimensions": {
                "intuition": 50 + random.randint(-10, 20),
                "decision": 50 + random.randint(-10, 20),
                "semantic": 50 + random.randint(-10, 20),
                "knowledge": 40 + random.randint(0, 30),
                "risk": 45 + random.randint(0, 30)
            },
            "suggestions": [
                "继续学习廉洁知识，提升专业素养",
                "多参与情境决策练习",
                "关注风险管控能力的提升"
            ],
            "mock": True
        }
        
        return jsonify({"success": True, "data": assessment_result})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)})

if __name__ == '__main__':
    print(f"🚀 清莲引 API 服务器启动中...")
    print(f"📍 端口: {PORT}")
    print(f"🔑 API Key状态: {'已配置' if API_KEY and API_KEY != 'your-doubao-api-key-here' else '未配置（使用模拟模式）'}")
    print(f"🌐 访问地址: http://localhost:{PORT}")
    app.run(host='0.0.0.0', port=PORT, debug=True)
