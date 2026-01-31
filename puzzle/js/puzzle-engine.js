/**
 * 中国省份拼图引擎
 * 实现拖拽交互、位置判断、吸附效果
 */

class PuzzleEngine {
    constructor(options = {}) {
        // 配置
        this.mapContainer = options.mapContainer || document.getElementById('mapArea');
        this.poolContainer = options.poolContainer || document.getElementById('puzzlePool');
        this.mapData = options.mapData || ChinaMapData;
        this.provinceInfo = options.provinceInfo || ProvinceInfo;

        // 状态
        this.pieces = new Map();        // 拼图块实例
        this.placedPieces = new Set();  // 已正确放置的省份ID
        this.currentDragging = null;    // 当前拖拽的拼图块

        // 配置参数
        this.snapDistance = options.snapDistance || 40;  // 吸附距离阈值
        this.scale = 1;

        // 回调
        this.onPiecePlaced = options.onPiecePlaced || null;
        this.onPuzzleComplete = options.onPuzzleComplete || null;
        this.onPieceClick = options.onPieceClick || null;

        // DOM 元素
        this.svgElement = null;
        this.targetLayer = null;
        this.pieceLayer = null;

        // 计时
        this.startTime = null;
        this.isCompleted = false;
    }

    /**
     * 初始化拼图引擎
     */
    init() {
        this._createSVGStructure();
        this._createTargetOutlines();
        this._createPuzzlePieces();
        this._bindEvents();
        this._shufflePieces();

        this.startTime = Date.now();
        console.log('拼图引擎初始化完成，共', this.pieces.size, '个拼图块');

        return this;
    }

    /**
     * 创建 SVG 结构
     */
    _createSVGStructure() {
        // 获取或创建 SVG 元素
        this.svgElement = this.mapContainer.querySelector('svg') || document.createElementNS('http://www.w3.org/2000/svg', 'svg');

        if (!this.svgElement.parentElement) {
            this.svgElement.setAttribute('viewBox', `0 0 ${this.mapData.viewBox.width} ${this.mapData.viewBox.height}`);
            this.svgElement.setAttribute('preserveAspectRatio', 'xMidYMid meet');
            this.svgElement.style.width = '100%';
            this.svgElement.style.height = '100%';
            this.mapContainer.appendChild(this.svgElement);
        }

        // 创建图层
        this.targetLayer = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        this.targetLayer.setAttribute('class', 'target-layer');
        this.svgElement.appendChild(this.targetLayer);

        this.pieceLayer = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        this.pieceLayer.setAttribute('class', 'piece-layer');
        this.svgElement.appendChild(this.pieceLayer);
    }

    /**
     * 创建目标轮廓（显示正确位置）
     */
    _createTargetOutlines() {
        Object.entries(this.mapData.provinces).forEach(([id, data]) => {
            const outline = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            outline.setAttribute('d', data.path);
            outline.setAttribute('class', 'target-outline');
            outline.setAttribute('data-id', id);
            outline.setAttribute('fill', 'rgba(255, 255, 255, 0.05)');
            outline.setAttribute('stroke', 'rgba(255, 255, 255, 0.2)');
            outline.setAttribute('stroke-width', '1');
            outline.setAttribute('stroke-dasharray', '4 2');
            this.targetLayer.appendChild(outline);
        });
    }

    /**
     * 创建拼图块
     */
    _createPuzzlePieces() {
        Object.entries(this.mapData.provinces).forEach(([id, data]) => {
            const info = this.provinceInfo[id] || { name: data.name, color: '#888888' };

            // 创建拼图块 SVG 组
            const pieceGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            pieceGroup.setAttribute('class', 'puzzle-piece');
            pieceGroup.setAttribute('data-id', id);
            pieceGroup.style.cursor = 'grab';

            // 省份形状
            const piecePath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            piecePath.setAttribute('d', data.path);
            piecePath.setAttribute('fill', info.color);
            piecePath.setAttribute('stroke', '#ffffff');
            piecePath.setAttribute('stroke-width', '2');
            piecePath.style.filter = 'drop-shadow(2px 2px 4px rgba(0,0,0,0.3))';
            pieceGroup.appendChild(piecePath);

            // 省份名称标签
            const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            label.setAttribute('x', data.center.x);
            label.setAttribute('y', data.center.y);
            label.setAttribute('text-anchor', 'middle');
            label.setAttribute('dominant-baseline', 'middle');
            label.setAttribute('fill', '#ffffff');
            label.setAttribute('font-size', this._getLabelFontSize(data.bounds));
            label.setAttribute('font-weight', 'bold');
            label.setAttribute('pointer-events', 'none');
            label.textContent = data.shortName || data.name.charAt(0);
            pieceGroup.appendChild(label);

            this.pieceLayer.appendChild(pieceGroup);

            // 记录拼图块状态
            this.pieces.set(id, {
                id,
                element: pieceGroup,
                data,
                info,
                isPlaced: false,
                originalTransform: '',
                currentX: 0,
                currentY: 0
            });
        });
    }

    /**
     * 根据省份大小计算标签字号
     */
    _getLabelFontSize(bounds) {
        const width = bounds.maxX - bounds.minX;
        const height = bounds.maxY - bounds.minY;
        const minDim = Math.min(width, height);

        if (minDim < 30) return '8';
        if (minDim < 50) return '10';
        if (minDim < 80) return '12';
        return '14';
    }

    /**
     * 绑定事件
     */
    _bindEvents() {
        // 鼠标事件
        this.svgElement.addEventListener('mousedown', this._handleDragStart.bind(this));
        document.addEventListener('mousemove', this._handleDragMove.bind(this));
        document.addEventListener('mouseup', this._handleDragEnd.bind(this));

        // 触摸事件
        this.svgElement.addEventListener('touchstart', this._handleTouchStart.bind(this), { passive: false });
        document.addEventListener('touchmove', this._handleTouchMove.bind(this), { passive: false });
        document.addEventListener('touchend', this._handleTouchEnd.bind(this));
    }

    /**
     * 获取 SVG 坐标
     */
    _getSVGPoint(clientX, clientY) {
        const pt = this.svgElement.createSVGPoint();
        pt.x = clientX;
        pt.y = clientY;
        const svgP = pt.matrixTransform(this.svgElement.getScreenCTM().inverse());
        return { x: svgP.x, y: svgP.y };
    }

    /**
     * 开始拖拽
     */
    _handleDragStart(e) {
        const pieceEl = e.target.closest('.puzzle-piece');
        if (!pieceEl) return;

        e.preventDefault();

        const pieceId = pieceEl.dataset.id;
        const piece = this.pieces.get(pieceId);

        if (!piece || piece.isPlaced) return;

        // 将拼图块移到最上层
        this.pieceLayer.appendChild(pieceEl);

        const svgPoint = this._getSVGPoint(e.clientX, e.clientY);

        this.currentDragging = {
            piece,
            element: pieceEl,
            startMouseX: svgPoint.x,
            startMouseY: svgPoint.y,
            startPieceX: piece.currentX,
            startPieceY: piece.currentY
        };

        pieceEl.style.cursor = 'grabbing';
        pieceEl.classList.add('dragging');

        // 高亮目标位置
        this._highlightTarget(pieceId, true);
    }

    /**
     * 拖拽移动
     */
    _handleDragMove(e) {
        if (!this.currentDragging) return;

        e.preventDefault();

        const { piece, element, startMouseX, startMouseY, startPieceX, startPieceY } = this.currentDragging;
        const svgPoint = this._getSVGPoint(e.clientX, e.clientY);

        // 计算移动距离
        const dx = svgPoint.x - startMouseX;
        const dy = svgPoint.y - startMouseY;

        // 更新位置
        piece.currentX = startPieceX + dx;
        piece.currentY = startPieceY + dy;
        element.setAttribute('transform', `translate(${piece.currentX}, ${piece.currentY})`);

        // 检测是否接近目标
        this._checkProximity(piece);
    }

    /**
     * 结束拖拽
     */
    _handleDragEnd(e) {
        if (!this.currentDragging) return;

        const { piece, element } = this.currentDragging;

        element.style.cursor = 'grab';
        element.classList.remove('dragging');

        // 取消高亮
        this._highlightTarget(piece.id, false);

        // 检查是否放置正确
        const isCorrect = this._checkPlacement(piece);

        if (isCorrect) {
            this._snapToTarget(piece, element);
            piece.isPlaced = true;
            this.placedPieces.add(piece.id);

            // 触发回调
            if (this.onPiecePlaced) {
                this.onPiecePlaced(piece);
            }

            // 检查是否全部完成
            if (this.placedPieces.size === this.pieces.size) {
                this._onPuzzleComplete();
            }
        } else {
            // 弹回原位
            this._animateReturn(piece, element);
        }

        this.currentDragging = null;
    }

    /**
     * 触摸开始
     */
    _handleTouchStart(e) {
        if (e.touches.length !== 1) return;

        const touch = e.touches[0];
        const target = document.elementFromPoint(touch.clientX, touch.clientY);
        const pieceEl = target?.closest('.puzzle-piece');

        if (!pieceEl) return;

        e.preventDefault();

        const pieceId = pieceEl.dataset.id;
        const piece = this.pieces.get(pieceId);

        if (!piece || piece.isPlaced) return;

        this.pieceLayer.appendChild(pieceEl);

        const svgPoint = this._getSVGPoint(touch.clientX, touch.clientY);

        this.currentDragging = {
            piece,
            element: pieceEl,
            startMouseX: svgPoint.x,
            startMouseY: svgPoint.y,
            startPieceX: piece.currentX,
            startPieceY: piece.currentY
        };

        pieceEl.classList.add('dragging');
        this._highlightTarget(pieceId, true);
    }

    /**
     * 触摸移动
     */
    _handleTouchMove(e) {
        if (!this.currentDragging || e.touches.length !== 1) return;

        e.preventDefault();

        const touch = e.touches[0];
        const { piece, element, startMouseX, startMouseY, startPieceX, startPieceY } = this.currentDragging;
        const svgPoint = this._getSVGPoint(touch.clientX, touch.clientY);

        const dx = svgPoint.x - startMouseX;
        const dy = svgPoint.y - startMouseY;

        piece.currentX = startPieceX + dx;
        piece.currentY = startPieceY + dy;
        element.setAttribute('transform', `translate(${piece.currentX}, ${piece.currentY})`);

        this._checkProximity(piece);
    }

    /**
     * 触摸结束
     */
    _handleTouchEnd(e) {
        this._handleDragEnd(e);
    }

    /**
     * 高亮目标位置
     */
    _highlightTarget(pieceId, highlight) {
        const target = this.targetLayer.querySelector(`[data-id="${pieceId}"]`);
        if (target) {
            if (highlight) {
                target.setAttribute('fill', 'rgba(255, 217, 61, 0.3)');
                target.setAttribute('stroke', '#FFD93D');
                target.setAttribute('stroke-width', '3');
                target.setAttribute('stroke-dasharray', 'none');
                target.classList.add('highlight');
            } else {
                target.setAttribute('fill', 'rgba(255, 255, 255, 0.05)');
                target.setAttribute('stroke', 'rgba(255, 255, 255, 0.2)');
                target.setAttribute('stroke-width', '1');
                target.setAttribute('stroke-dasharray', '4 2');
                target.classList.remove('highlight');
            }
        }
    }

    /**
     * 检测是否接近目标
     */
    _checkProximity(piece) {
        const distance = this._getDistanceFromTarget(piece);
        const target = this.targetLayer.querySelector(`[data-id="${piece.id}"]`);

        if (distance < this.snapDistance * 1.5) {
            target?.setAttribute('fill', 'rgba(38, 222, 129, 0.4)');
            target?.setAttribute('stroke', '#26DE81');
        } else {
            target?.setAttribute('fill', 'rgba(255, 217, 61, 0.3)');
            target?.setAttribute('stroke', '#FFD93D');
        }
    }

    /**
     * 计算拼图块与目标的距离
     */
    _getDistanceFromTarget(piece) {
        const targetCenter = piece.data.center;
        const currentCenterX = targetCenter.x + piece.currentX;
        const currentCenterY = targetCenter.y + piece.currentY;

        const dx = currentCenterX - targetCenter.x;
        const dy = currentCenterY - targetCenter.y;

        return Math.sqrt(dx * dx + dy * dy);
    }

    /**
     * 检查是否放置正确
     */
    _checkPlacement(piece) {
        const distance = this._getDistanceFromTarget(piece);
        return distance <= this.snapDistance;
    }

    /**
     * 吸附到目标位置
     */
    _snapToTarget(piece, element) {
        // 添加动画效果
        element.style.transition = 'transform 0.3s ease-out';

        // 重置到原位（偏移量为0）
        piece.currentX = 0;
        piece.currentY = 0;
        element.setAttribute('transform', 'translate(0, 0)');

        // 标记为已放置
        element.classList.add('placed');
        element.style.cursor = 'pointer';

        // 隐藏目标轮廓
        const target = this.targetLayer.querySelector(`[data-id="${piece.id}"]`);
        if (target) {
            target.style.opacity = '0';
        }

        // 移除动画
        setTimeout(() => {
            element.style.transition = '';
        }, 300);

        // 绑定点击查看详情
        element.onclick = () => {
            if (this.onPieceClick) {
                this.onPieceClick(piece);
            }
        };
    }

    /**
     * 动画返回原位
     */
    _animateReturn(piece, element) {
        element.style.transition = 'transform 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55)';

        // 返回到初始打乱位置
        element.setAttribute('transform', `translate(${piece.shuffleX}, ${piece.shuffleY})`);
        piece.currentX = piece.shuffleX;
        piece.currentY = piece.shuffleY;

        setTimeout(() => {
            element.style.transition = '';
        }, 400);
    }

    /**
     * 打乱拼图块
     */
    _shufflePieces() {
        const viewBox = this.mapData.viewBox;
        const pieces = Array.from(this.pieces.values());

        // 随机打乱顺序
        for (let i = pieces.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [pieces[i], pieces[j]] = [pieces[j], pieces[i]];
        }

        // 分配随机位置（在地图区域外围）
        pieces.forEach((piece, index) => {
            const angle = (index / pieces.length) * Math.PI * 2;
            const radius = Math.max(viewBox.width, viewBox.height) * 0.3;

            // 随机偏移
            const randomOffsetX = (Math.random() - 0.5) * 200;
            const randomOffsetY = (Math.random() - 0.5) * 200;

            // 计算目标中心
            const targetCenter = piece.data.center;

            // 打乱位置 = 目标位置的偏移
            piece.shuffleX = Math.cos(angle) * radius + randomOffsetX;
            piece.shuffleY = Math.sin(angle) * radius + randomOffsetY;
            piece.currentX = piece.shuffleX;
            piece.currentY = piece.shuffleY;

            piece.element.setAttribute('transform', `translate(${piece.currentX}, ${piece.currentY})`);
        });
    }

    /**
     * 拼图完成
     */
    _onPuzzleComplete() {
        if (this.isCompleted) return;

        this.isCompleted = true;
        const elapsedTime = Math.floor((Date.now() - this.startTime) / 1000);

        if (this.onPuzzleComplete) {
            this.onPuzzleComplete({
                time: elapsedTime,
                totalPieces: this.pieces.size
            });
        }
    }

    /**
     * 重新开始
     */
    reset() {
        this.placedPieces.clear();
        this.isCompleted = false;
        this.startTime = Date.now();

        // 重置所有拼图块
        this.pieces.forEach((piece) => {
            piece.isPlaced = false;
            piece.element.classList.remove('placed');
            piece.element.style.cursor = 'grab';
            piece.element.onclick = null;

            // 显示目标轮廓
            const target = this.targetLayer.querySelector(`[data-id="${piece.id}"]`);
            if (target) {
                target.style.opacity = '1';
                target.setAttribute('fill', 'rgba(255, 255, 255, 0.05)');
                target.setAttribute('stroke', 'rgba(255, 255, 255, 0.2)');
            }
        });

        // 重新打乱
        this._shufflePieces();
    }

    /**
     * 获取进度
     */
    getProgress() {
        return {
            placed: this.placedPieces.size,
            total: this.pieces.size,
            percentage: Math.round((this.placedPieces.size / this.pieces.size) * 100)
        };
    }

    /**
     * 获取用时
     */
    getElapsedTime() {
        if (!this.startTime) return 0;
        return Math.floor((Date.now() - this.startTime) / 1000);
    }

    /**
     * 格式化时间
     */
    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PuzzleEngine;
}
