/**
 * 清莲引·机器学习引擎
 * 多模型对比实验系统 - 支持逻辑回归、决策树、随机森林、SVM、神经网络
 */

// 机器学习引擎
class MLEngine {
    constructor() {
        this.models = {};
        this.modelConfigs = {
            logisticRegression: {
                name: '逻辑回归',
                nameEn: 'Logistic Regression',
                color: '#4ade80'
            },
            decisionTree: {
                name: '决策树',
                nameEn: 'Decision Tree',
                color: '#facc15'
            },
            randomForest: {
                name: '随机森林',
                nameEn: 'Random Forest',
                color: '#38bdf8'
            },
            svm: {
                name: '支持向量机',
                nameEn: 'SVM',
                color: '#f472b6'
            },
            neuralNetwork: {
                name: '神经网络',
                nameEn: 'Neural Network',
                color: '#a78bfa'
            }
        };
        this.trainingHistory = {};
        this.currentModel = null;
        this.featureNames = ['越界次数', '负面词比例', '危险区时间', '廉洁词数', '答题正确率'];
        this.isTraining = false;
    }

    // 特征提取 - 从游戏数据中提取特征
    extractFeatures(gameData) {
        const {
            crossCount = 0,
            negativeWords = [],
            collectedWords = [],
            dangerTime = 0,
            quizCorrect = 0,
            quizTotal = 1
        } = gameData;

        return {
            crossCount: Math.min(crossCount / 10, 1), // 归一化
            negativeRatio: negativeWords.length / Math.max(1, collectedWords.length + negativeWords.length),
            dangerTime: Math.min(dangerTime / 60, 1), // 归一化到60秒
            cleanWordRatio: collectedWords.length / Math.max(1, collectedWords.length + negativeWords.length),
            quizAccuracy: quizCorrect / Math.max(1, quizTotal)
        };
    }

    // 生成模拟训练数据
    generateTrainingData(samples = 500) {
        const X = [];
        const y = [];
        for (let i = 0; i < samples; i++) {
            const riskLevel = Math.random();
            const features = {
                crossCount: riskLevel * 0.8 + Math.random() * 0.2,
                negativeRatio: riskLevel * 0.9 + Math.random() * 0.1,
                dangerTime: riskLevel * 0.7 + Math.random() * 0.3,
                cleanWordRatio: (1 - riskLevel) * 0.8 + Math.random() * 0.2,
                quizAccuracy: (1 - riskLevel) * 0.6 + Math.random() * 0.4
            };
            X.push(Object.values(features));
            y.push(riskLevel > 0.5 ? 1 : 0);
        }
        return { X, y };
    }

    // 逻辑回归实现
    trainLogisticRegression(X, y, options = {}) {
        const {
            learningRate = 0.01,
            iterations = 1000,
            regularization = 0.01
        } = options;

        const m = X.length;
        const n = X[0].length;
        let weights = Array(n).fill(0).map(() => Math.random() * 0.01);
        let bias = 0;
        const history = [];

        for (let iter = 0; iter < iterations; iter++) {
            const dw = Array(n).fill(0);
            let db = 0;

            for (let i = 0; i < m; i++) {
                const xi = X[i];
                const yi = y[i];
                const z = weights.reduce((sum, w, j) => sum + w * xi[j], 0) + bias;
                const sigmoid = 1 / (1 + Math.exp(-Math.max(-500, Math.min(500, z))));
                const error = sigmoid - yi;

                for (let j = 0; j < n; j++) {
                    dw[j] += error * xi[j];
                }
                db += error;
            }

            for (let j = 0; j < n; j++) {
                weights[j] -= learningRate * (dw[j] / m + regularization * weights[j]);
            }
            bias -= learningRate * (db / m);

            if (iter % 100 === 0) {
                const predictions = X.map(xi => {
                    const z = weights.reduce((sum, w, j) => sum + w * xi[j], 0) + bias;
                    return 1 / (1 + Math.exp(-z)) > 0.5 ? 1 : 0;
                });
                const accuracy = predictions.filter((p, i) => p === y[i]).length / m;
                history.push({ iteration: iter, loss: this.calculateLoss(weights, bias, X, y), accuracy });
            }
        }

        return { weights, bias, history };
    }

    // 决策树实现
    trainDecisionTree(X, y, options = {}) {
        const { maxDepth = 5, minSamplesSplit = 10 } = options;

        function buildTree(X, y, depth) {
            if (depth >= maxDepth || X.length < minSamplesSplit || y.every(v => v === y[0])) {
                return { isLeaf: true, value: y.reduce((a, b) => a + b, 0) / y.length };
            }

            const bestSplit = findBestSplit(X, y);
            if (!bestSplit) {
                return { isLeaf: true, value: y.reduce((a, b) => a + b, 0) / y.length };
            }

            const { featureIndex, threshold, leftX, leftY, rightX, rightY } = bestSplit;

            return {
                isLeaf: false,
                featureIndex,
                threshold,
                left: buildTree(leftX, leftY, depth + 1),
                right: buildTree(rightX, rightY, depth + 1)
            };
        }

        function findBestSplit(X, y) {
            let bestGini = Infinity;
            let bestSplit = null;

            for (let featureIndex = 0; featureIndex < X[0].length; featureIndex++) {
                const values = X.map(x => x[featureIndex]).sort((a, b) => a - b);
                for (let i = 0; i < Math.min(values.length - 1, 10); i++) {
                    const threshold = (values[i] + values[i + 1]) / 2;
                    const leftY = X.map((x, j) => x[featureIndex] <= threshold ? y[j] : null).filter(v => v !== null);
                    const rightY = X.map((x, j) => x[featureIndex] > threshold ? y[j] : null).filter(v => v !== null);

                    if (leftY.length === 0 || rightY.length === 0) continue;

                    const gini = (leftY.length / y.length) * this.calculateGini(leftY) +
                                 (rightY.length / y.length) * this.calculateGini(rightY);

                    if (gini < bestGini) {
                        bestGini = gini;
                        bestSplit = {
                            featureIndex,
                            threshold,
                            leftX: X.filter((x, j) => x[featureIndex] <= threshold),
                            leftY: X.filter((x, j) => x[featureIndex] <= threshold).map((_, j) => y[j]),
                            rightX: X.filter((x, j) => x[featureIndex] > threshold),
                            rightY: X.filter((x, j) => x[featureIndex] > threshold).map((_, j) => y[j])
                        };
                    }
                }
            }

            return bestSplit;
        }

        const tree = buildTree(X, y, 0);
        return { tree, history: [{ iteration: 1, accuracy: this.evaluateTree(tree, X, y) }] };
    }

    calculateGini(y) {
        if (y.length === 0) return 0;
        const counts = y.reduce((acc, v) => { acc[v] = (acc[v] || 0) + 1; return acc; }, {});
        let gini = 1;
        for (const v of Object.values(counts)) {
            gini -= (v / y.length) ** 2;
        }
        return gini;
    }

    evaluateTree(tree, X, y) {
        let correct = 0;
        for (let i = 0; i < X.length; i++) {
            let node = tree;
            while (!node.isLeaf) {
                if (X[i][node.featureIndex] <= node.threshold) {
                    node = node.left;
                } else {
                    node = node.right;
                }
            }
            if (Math.round(node.value) === y[i]) correct++;
        }
        return correct / y.length;
    }

    // 随机森林实现
    trainRandomForest(X, y, options = {}) {
        const { nTrees = 10, maxDepth = 5, sampleRatio = 0.8 } = options;
        const trees = [];
        const history = [];

        for (let t = 0; t < nTrees; t++) {
            const sampleSize = Math.floor(X.length * sampleRatio);
            const indices = Array(X.length).fill(0).map((_, i) => i)
                .sort(() => Math.random() - 0.5).slice(0, sampleSize);
            const sampleX = indices.map(i => X[i]);
            const sampleY = indices.map(i => y[i]);

            const { tree } = this.trainDecisionTree(sampleX, sampleY, { maxDepth });
            trees.push(tree);
        }

        const accuracy = this.evaluateForest(trees, X, y);
        history.push({ iteration: nTrees, accuracy });

        return { trees, history };
    }

    evaluateForest(trees, X, y) {
        let correct = 0;
        for (let i = 0; i < X.length; i++) {
            const predictions = trees.map(tree => this.predictTree(tree, X[i]));
            const avgPrediction = predictions.reduce((a, b) => a + b, 0) / predictions.length;
            if (Math.round(avgPrediction) === y[i]) correct++;
        }
        return correct / X.length;
    }

    predictTree(tree, x) {
        let node = tree;
        while (!node.isLeaf) {
            if (x[node.featureIndex] <= node.threshold) {
                node = node.left;
            } else {
                node = node.right;
            }
        }
        return node.value;
    }

    // SVM实现
    trainSVM(X, y, options = {}) {
        const { epochs = 1000, learningRate = 0.01, C = 1.0 } = options;

        let w = Array(X[0].length).fill(0);
        let b = 0;
        const history = [];

        for (let epoch = 0; epoch < epochs; epoch++) {
            let totalLoss = 0;

            for (let i = 0; i < X.length; i++) {
                const xi = X[i];
                const yi = y[i];
                const score = yi * (w.reduce((s, wj, j) => s + wj * xi[j], 0) + b);

                if (score < 1) {
                    for (let j = 0; j < w.length; j++) {
                        w[j] += learningRate * (yi * xi[j] - 2 * C * w[j]);
                    }
                    b += learningRate * yi;
                    totalLoss += Math.max(0, 1 - score);
                } else {
                    for (let j = 0; j < w.length; j++) {
                        w[j] += learningRate * 2 * C * w[j];
                    }
                }
            }

            if (epoch % 100 === 0) {
                const predictions = X.map(xi =>
                    w.reduce((s, wj, j) => s + wj * xi[j], 0) + b > 0 ? 1 : 0
                );
                const accuracy = predictions.filter((p, i) => p === y[i]).length / X.length;
                history.push({ iteration: epoch, loss: totalLoss / X.length, accuracy });
            }
        }

        return { weights: w, bias: b, history };
    }

    // 神经网络实现
    trainNeuralNetwork(X, y, options = {}) {
        const {
            hiddenLayers = [16, 8],
            learningRate = 0.01,
            epochs = 500,
            batchSize = 32
        } = options;

        const layerSizes = [X[0].length, ...hiddenLayers, 1];
        let weights = [];
        let biases = [];

        for (let i = 0; i < layerSizes.length - 1; i++) {
            weights.push(Array(layerSizes[i + 1]).fill(0).map(() =>
                Array(layerSizes[i]).fill(0).map(() => Math.random() * 0.1 - 0.05)
            ));
            biases.push(Array(layerSizes[i + 1]).fill(0));
        }

        const history = [];

        for (let epoch = 0; epoch < epochs; epoch++) {
            const indices = Array(X.length).fill(0).map((_, i) => i)
                .sort(() => Math.random() - 0.5);

            let totalLoss = 0;

            for (let b = 0; b < indices.length; b += batchSize) {
                const batchIndices = indices.slice(b, b + batchSize);
                const batchX = batchIndices.map(i => X[i]);
                const batchY = batchIndices.map(i => y[i]);

                const activations = [batchX];
                let forwardPass = batchX;

                for (let l = 0; l < weights.length; l++) {
                    const z = forwardPass.map(xi =>
                        weights[l].map((wj, j) => wj.reduce((s, wjk, k) => s + wjk * xi[k], 0) + biases[l][j])
                    );
                    const a = l === weights.length - 1
                        ? z.map(zi => 1 / (1 + Math.exp(-Math.max(-500, Math.min(500, zi)))))
                        : z.map(zi => Math.max(0, zi)); // ReLU
                    activations.push(a);
                    forwardPass = a;
                }

                const predictions = forwardPass.map(a => a[0] > 0.5 ? 1 : 0);
                totalLoss += predictions.filter((p, i) => p === batchY[i]).length / batchY.length;

                // 反向传播
                let delta = forwardPass.map((a, i) => a - batchY[i]);
                for (let l = weights.length - 1; l >= 0; l--) {
                    const da = activations[l].map(ai => Math.max(0, ai));

                    for (let j = 0; j < weights[l].length; j++) {
                        for (let k = 0; k < weights[l][j].length; k++) {
                            weights[l][j][k] -= learningRate * delta[j] * da[k] / batchSize;
                        }
                        biases[l][j] -= learningRate * delta[j] / batchSize;
                    }

                    if (l > 0) {
                        delta = da.map((_, k) => weights[l].reduce((s, wj) => s + wj[k] * delta.reduce((ss, dj) => ss + dj, 0), 0) / weights[l].length);
                    }
                }
            }

            if (epoch % 50 === 0) {
                history.push({
                    iteration: epoch,
                    loss: 1 - totalLoss / Math.ceil(X.length / batchSize),
                    accuracy: totalLoss / Math.ceil(X.length / batchSize)
                });
            }
        }

        return { weights, biases, layerSizes, history };
    }

    // 计算损失
    calculateLoss(weights, bias, X, y) {
        let loss = 0;
        for (let i = 0; i < X.length; i++) {
            const z = weights.reduce((sum, w, j) => sum + w * X[i][j], 0) + bias;
            const sigmoid = 1 / (1 + Math.exp(-Math.max(-500, Math.min(500, z))));
            loss += -(y[i] * Math.log(sigmoid + 1e-10) + (1 - y[i]) * Math.log(1 - sigmoid + 1e-10));
        }
        return loss / X.length;
    }

    // 训练所有模型
    async trainAllModels(X, y, options = {}) {
        this.isTraining = true;
        const results = {};

        // 1. 逻辑回归
        results.logisticRegression = this.trainLogisticRegression(X, y, options.logisticRegression || {});

        // 2. 决策树
        results.decisionTree = this.trainDecisionTree(X, y, options.decisionTree || {});

        // 3. 随机森林
        results.randomForest = this.trainRandomForest(X, y, options.randomForest || {});

        // 4. SVM
        results.svm = this.trainSVM(X, y, options.svm || {});

        // 5. 神经网络
        results.neuralNetwork = this.trainNeuralNetwork(X, y, options.neuralNetwork || {});

        this.models = results;
        this.trainingHistory = Object.fromEntries(
            Object.entries(results).map(([k, v]) => [k, v.history || [{ iteration: 1, accuracy: 0 }]])
        );

        this.isTraining = false;
        return results;
    }

    // 使用最佳模型预测
    predict(features) {
        const x = Object.values(features);
        const predictions = {};

        if (this.models.logisticRegression) {
            const { weights, bias } = this.models.logisticRegression;
            const score = weights.reduce((s, w, i) => s + w * x[i], 0) + bias;
            predictions.logisticRegression = 1 / (1 + Math.exp(-score));
        }

        if (this.models.decisionTree) {
            predictions.decisionTree = this.predictTree(this.models.decisionTree.tree, x);
        }

        if (this.models.randomForest) {
            const preds = this.models.randomForest.trees.map(tree => this.predictTree(tree, x));
            predictions.randomForest = preds.reduce((a, b) => a + b, 0) / preds.length;
        }

        if (this.models.svm) {
            const { weights, bias } = this.models.svm;
            const score = weights.reduce((s, w, i) => s + w * x[i], 0) + bias;
            predictions.svm = score > 0 ? 1 : 0;
        }

        if (this.models.neuralNetwork) {
            const { weights, biases } = this.models.neuralNetwork;
            let a = x;
            for (let l = 0; l < weights.length; l++) {
                a = weights[l].map((wj, j) => {
                    const z = wj.reduce((s, wjk, k) => s + wjk * a[k], 0) + biases[l][j];
                    return l === weights.length - 1 ? 1 / (1 + Math.exp(-z)) : Math.max(0, z);
                });
            }
            predictions.neuralNetwork = a[0];
        }

        // 集成预测
        const activePreds = Object.values(predictions).filter(p => typeof p === 'number' && !isNaN(p));
        if (activePreds.length > 0) {
            predictions.ensemble = activePreds.reduce((a, b) => a + b, 0) / activePreds.length;
        }

        return predictions;
    }

    // 获取模型性能对比
    getModelComparison() {
        return Object.entries(this.models).map(([key, model]) => {
            const config = this.modelConfigs[key];
            const history = this.trainingHistory[key] || [];
            const lastMetrics = history[history.length - 1] || { accuracy: 0 };
            return {
                name: config.name,
                nameEn: config.nameEn,
                color: config.color,
                accuracy: lastMetrics.accuracy,
                iterations: history.length
            };
        }).sort((a, b) => b.accuracy - a.accuracy);
    }

    // 获取训练历史
    getTrainingHistory() {
        return this.trainingHistory;
    }

    // 导出模型
    exportModels() {
        return {
            models: this.models,
            trainingHistory: this.trainingHistory,
            featureNames: this.featureNames,
            exportDate: new Date().toISOString()
        };
    }

    // 导入模型
    importModels(data) {
        this.models = data.models;
        this.trainingHistory = data.trainingHistory;
        this.featureNames = data.featureNames || this.featureNames;
    }
}

// 训练可视化组件
class TrainingVisualizer {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.canvas = null;
        this.ctx = null;
        this.animationFrame = null;
    }

    init(width = 600, height = 400) {
        if (!this.container) return;

        this.container.innerHTML = `
            <div class="training-visualizer">
                <div class="viz-header">
                    <h4>🧠 模型训练过程可视化</h4>
                    <div class="viz-controls">
                        <button class="viz-btn" onclick="trainingVisualizer.resetZoom()">重置</button>
                    </div>
                </div>
                <div class="viz-content">
                    <div class="viz-chart">
                        <canvas id="trainingChart"></canvas>
                    </div>
                    <div class="viz-legend" id="chartLegend"></div>
                </div>
                <div class="viz-metrics" id="metricsPanel"></div>
            </div>
        `;

        this.canvas = document.getElementById('trainingChart');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = width;
        this.canvas.height = height;
    }

    drawCurves(history, modelConfigs) {
        if (!this.ctx) return;

        const ctx = this.ctx;
        const width = this.canvas.width;
        const height = this.canvas.height;
        const padding = { top: 30, right: 30, bottom: 50, left: 60 };

        // 清空画布
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(0, 0, width, height);

        // 绘制网格
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 0.5;
        for (let i = 0; i <= 10; i++) {
            const y = padding.top + (height - padding.top - padding.bottom) * i / 10;
            ctx.beginPath();
            ctx.moveTo(padding.left, y);
            ctx.lineTo(width - padding.right, y);
            ctx.stroke();
        }

        // 找最大值
        let maxIter = 0;
        let maxAccuracy = 1;
        Object.values(history).forEach(h => {
            h.forEach(p => {
                maxIter = Math.max(maxIter, p.iteration || p.iter);
                maxAccuracy = Math.max(maxAccuracy, p.accuracy || 0);
            });
        });

        // 绘制坐标轴
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(padding.left, padding.top);
        ctx.lineTo(padding.left, height - padding.bottom);
        ctx.lineTo(width - padding.right, height - padding.bottom);
        ctx.stroke();

        // 轴标签
        ctx.fillStyle = '#94a3b8';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('迭代次数', width / 2, height - 10);
        ctx.save();
        ctx.translate(15, height / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.fillText('准确率', 0, 0);
        ctx.restore();

        // 绘制每个模型的曲线
        const colors = ['#4ade80', '#facc15', '#38bdf8', '#f472b6', '#a78bfa'];
        const modelNames = Object.keys(history);
        let colorIndex = 0;

        modelNames.forEach((modelName, idx) => {
            const data = history[modelName];
            if (!data || data.length === 0) return;

            const color = colors[colorIndex % colors.length];
            colorIndex++;

            ctx.strokeStyle = color;
            ctx.lineWidth = 2;
            ctx.beginPath();

            data.forEach((point, i) => {
                const x = padding.left + (width - padding.left - padding.right) * (point.iteration || point.iter) / maxIter;
                const y = height - padding.bottom - (height - padding.top - padding.bottom) * (point.accuracy || 0);

                if (i === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            });

            ctx.stroke();

            // 绘制点
            ctx.fillStyle = color;
            data.forEach((point, i) => {
                if (i % Math.ceil(data.length / 10) !== 0 && i !== data.length - 1) return;
                const x = padding.left + (width - padding.left - padding.right) * (point.iteration || point.iter) / maxIter;
                const y = height - padding.bottom - (height - padding.top - padding.bottom) * (point.accuracy || 0);
                ctx.beginPath();
                ctx.arc(x, y, 4, 0, Math.PI * 2);
                ctx.fill();
            });
        });

        // 更新图例
        this.updateLegend(modelNames, colors);

        // 更新指标面板
        this.updateMetrics(history, modelConfigs);
    }

    updateLegend(modelNames, colors) {
        const legend = document.getElementById('chartLegend');
        if (!legend) return;

        legend.innerHTML = modelNames.map((name, i) => `
            <div class="legend-item">
                <span class="legend-color" style="background: ${colors[i % colors.length]}"></span>
                <span class="legend-name">${modelConfigs[name]?.name || name}</span>
            </div>
        `).join('');
    }

    updateMetrics(history, modelConfigs) {
        const metrics = document.getElementById('metricsPanel');
        if (!metrics) return;

        metrics.innerHTML = Object.entries(history).map(([key, data]) => {
            const lastPoint = data[data.length - 1] || {};
            const config = modelConfigs[key] || {};
            return `
                <div class="metric-card" style="border-left: 3px solid ${config.color || '#64748b'}">
                    <div class="metric-name">${config.name || key}</div>
                    <div class="metric-value">${((lastPoint.accuracy || 0) * 100).toFixed(1)}%</div>
                    <div class="metric-label">准确率</div>
                </div>
            `;
        }).join('');
    }

    resetZoom() {
        // 重置缩放
    }

    destroy() {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
        if (this.container) {
            this.container.innerHTML = '';
        }
    }
}

// 模型对比可视化
class ModelComparator {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.models = null;
    }

    init() {
        if (!this.container) return;
        this.render();
    }

    setModels(modelComparison) {
        this.models = modelComparison;
        this.render();
    }

    render() {
        if (!this.container) return;

        this.container.innerHTML = `
            <div class="model-comparator">
                <h4>📊 模型性能对比</h4>
                <div class="comparison-chart">
                    <canvas id="comparisonCanvas"></canvas>
                </div>
                <div class="comparison-table">
                    <table>
                        <thead>
                            <tr>
                                <th>模型</th>
                                <th>准确率</th>
                                <th>性能评级</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${(this.models || []).map((m, i) => `
                                <tr>
                                    <td>
                                        <span class="model-color" style="background: ${m.color}"></span>
                                        ${m.name}
                                    </td>
                                    <td>${(m.accuracy * 100).toFixed(1)}%</td>
                                    <td>${this.getRating(m.accuracy)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;

        this.drawBarChart();
    }

    getRating(accuracy) {
        if (accuracy >= 0.9) return '⭐⭐⭐⭐⭐';
        if (accuracy >= 0.8) return '⭐⭐⭐⭐';
        if (accuracy >= 0.7) return '⭐⭐⭐';
        if (accuracy >= 0.6) return '⭐⭐';
        return '⭐';
    }

    drawBarChart() {
        const canvas = document.getElementById('comparisonCanvas');
        if (!canvas || !this.models) return;

        const ctx = canvas.getContext('2d');
        const width = canvas.width = 500;
        const height = canvas.height = 200;

        ctx.fillStyle = '#1e293b';
        ctx.fillRect(0, 0, width, height);

        const barHeight = 25;
        const gap = 10;
        const startY = 30;

        this.models.forEach((model, i) => {
            const y = startY + i * (barHeight + gap);
            const barWidth = (width - 100) * model.accuracy;

            ctx.fillStyle = '#334155';
            ctx.fillRect(100, y, width - 100, barHeight);

            ctx.fillStyle = model.color;
            ctx.fillRect(100, y, barWidth, barHeight);

            ctx.fillStyle = '#e2e8f0';
            ctx.font = '12px Arial';
            ctx.textAlign = 'right';
            ctx.fillText(model.name, 90, y + barHeight / 2 + 4);

            ctx.textAlign = 'left';
            ctx.fillText(`${(model.accuracy * 100).toFixed(1)}%`, 105 + barWidth, y + barHeight / 2 + 4);
        });
    }
}

// 混淆矩阵可视化
class ConfusionMatrix {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
    }

    init() {
        if (!this.container) return;
        this.render();
    }

    setMatrix(matrix, labels = ['低风险', '高风险']) {
        this.matrix = matrix;
        this.labels = labels;
        this.render();
    }

    render() {
        if (!this.container || !this.matrix) return;

        const size = this.matrix.length;
        const cellSize = 80;

        this.container.innerHTML = `
            <div class="confusion-matrix">
                <h4>📈 混淆矩阵</h4>
                <div class="matrix-grid" style="grid-template-columns: repeat(${size + 1}, ${cellSize}px);">
                    <div class="matrix-cell header"></div>
                    ${this.labels.map(l => `<div class="matrix-cell header">${l}</div>`).join('')}
                    ${this.matrix.map((row, i) => `
                        <div class="matrix-cell header">${this.labels[i]}</div>
                        ${row.map((val, j) => `
                            <div class="matrix-cell" style="background: ${this.getColor(val, i === j)}">
                                ${(val * 100).toFixed(0)}%
                            </div>
                        `).join('')}
                    `).join('')}
                </div>
            </div>
        `;
    }

    getColor(value, isDiagonal) {
        const intensity = Math.min(value * 2, 1);
        if (isDiagonal) {
            return `rgba(74, 222, 128, ${0.3 + intensity * 0.7})`;
        }
        return `rgba(239, 68, 68, ${0.3 + intensity * 0.7})`;
    }
}

// 全局实例
const mlEngine = new MLEngine();
let trainingVisualizer = null;
let modelComparator = null;
let confusionMatrix = null;

// 导出到window
window.mlEngine = mlEngine;
window.MLEngine = MLEngine;
window.TrainingVisualizer = TrainingVisualizer;
window.ModelComparator = ModelComparator;
window.ConfusionMatrix = ConfusionMatrix;
window.trainingVisualizer = trainingVisualizer;
window.modelComparator = modelComparator;
window.confusionMatrix = confusionMatrix;
