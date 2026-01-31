/**
 * 中国地图 SVG 数据
 * 包含 34 个行政区的路径和位置信息
 * 坐标系：基于 1000x800 的视图框
 */

const ChinaMapData = {
    // 地图视图框
    viewBox: {
        width: 1000,
        height: 800,
        minLng: 73.5,
        maxLng: 135.5,
        minLat: 17.5,
        maxLat: 53.5
    },

    // 各省份数据
    provinces: {
        // ============ 直辖市 (4) ============
        "beijing": {
            id: "beijing",
            name: "北京",
            shortName: "京",
            type: "municipality",
            path: "M 695,185 L 700,180 L 710,182 L 715,190 L 712,198 L 705,200 L 698,195 L 695,185 Z",
            center: { x: 705, y: 190 },
            bounds: { minX: 695, maxX: 715, minY: 180, maxY: 200 }
        },
        "tianjin": {
            id: "tianjin",
            name: "天津",
            shortName: "津",
            type: "municipality",
            path: "M 712,198 L 720,195 L 728,200 L 730,210 L 725,218 L 715,215 L 712,205 L 712,198 Z",
            center: { x: 720, y: 207 },
            bounds: { minX: 712, maxX: 730, minY: 195, maxY: 218 }
        },
        "shanghai": {
            id: "shanghai",
            name: "上海",
            shortName: "沪",
            type: "municipality",
            path: "M 785,380 L 792,378 L 798,385 L 795,395 L 788,398 L 782,392 L 785,380 Z",
            center: { x: 790, y: 388 },
            bounds: { minX: 782, maxX: 798, minY: 378, maxY: 398 }
        },
        "chongqing": {
            id: "chongqing",
            name: "重庆",
            shortName: "渝",
            type: "municipality",
            path: "M 530,420 L 560,410 L 580,420 L 590,445 L 580,470 L 555,480 L 530,470 L 520,445 L 530,420 Z",
            center: { x: 555, y: 445 },
            bounds: { minX: 520, maxX: 590, minY: 410, maxY: 480 }
        },

        // ============ 东北三省 ============
        "heilongjiang": {
            id: "heilongjiang",
            name: "黑龙江",
            shortName: "黑",
            type: "province",
            path: "M 770,45 L 820,35 L 870,50 L 920,40 L 950,60 L 960,90 L 940,120 L 900,140 L 850,135 L 820,150 L 780,140 L 750,120 L 740,90 L 750,60 L 770,45 Z",
            center: { x: 850, y: 90 },
            bounds: { minX: 740, maxX: 960, minY: 35, maxY: 150 }
        },
        "jilin": {
            id: "jilin",
            name: "吉林",
            shortName: "吉",
            type: "province",
            path: "M 780,140 L 820,150 L 870,145 L 920,155 L 940,175 L 920,195 L 870,200 L 830,195 L 790,185 L 765,170 L 760,155 L 780,140 Z",
            center: { x: 850, y: 170 },
            bounds: { minX: 760, maxX: 940, minY: 140, maxY: 200 }
        },
        "liaoning": {
            id: "liaoning",
            name: "辽宁",
            shortName: "辽",
            type: "province",
            path: "M 765,170 L 790,185 L 830,195 L 870,200 L 885,220 L 870,245 L 830,260 L 790,255 L 760,240 L 740,220 L 745,195 L 765,170 Z",
            center: { x: 810, y: 220 },
            bounds: { minX: 740, maxX: 885, minY: 170, maxY: 260 }
        },

        // ============ 华北地区 ============
        "hebei": {
            id: "hebei",
            name: "河北",
            shortName: "冀",
            type: "province",
            path: "M 670,180 L 695,185 L 698,195 L 705,200 L 712,198 L 712,205 L 715,215 L 725,218 L 740,220 L 760,240 L 750,265 L 730,280 L 700,275 L 680,260 L 660,245 L 650,220 L 660,195 L 670,180 Z",
            center: { x: 700, y: 230 },
            bounds: { minX: 650, maxX: 760, minY: 180, maxY: 280 }
        },
        "shanxi": {
            id: "shanxi",
            name: "山西",
            shortName: "晋",
            type: "province",
            path: "M 620,210 L 650,220 L 660,245 L 680,260 L 680,290 L 670,320 L 645,340 L 620,330 L 600,305 L 595,270 L 605,240 L 620,210 Z",
            center: { x: 640, y: 280 },
            bounds: { minX: 595, maxX: 680, minY: 210, maxY: 340 }
        },
        "neimenggu": {
            id: "neimenggu",
            name: "内蒙古",
            shortName: "蒙",
            type: "autonomous",
            path: "M 450,80 L 520,65 L 600,70 L 680,85 L 740,90 L 750,120 L 780,140 L 760,155 L 765,170 L 745,195 L 740,220 L 760,240 L 750,265 L 730,280 L 700,275 L 670,180 L 620,210 L 580,190 L 520,170 L 470,160 L 420,140 L 400,110 L 420,90 L 450,80 Z",
            center: { x: 580, y: 150 },
            bounds: { minX: 400, maxX: 780, minY: 65, maxY: 280 }
        },

        // ============ 华东地区 ============
        "shandong": {
            id: "shandong",
            name: "山东",
            shortName: "鲁",
            type: "province",
            path: "M 700,275 L 730,280 L 760,275 L 790,280 L 810,300 L 800,320 L 770,330 L 740,340 L 710,335 L 690,315 L 680,290 L 700,275 Z",
            center: { x: 745, y: 305 },
            bounds: { minX: 680, maxX: 810, minY: 275, maxY: 340 }
        },
        "jiangsu": {
            id: "jiangsu",
            name: "江苏",
            shortName: "苏",
            type: "province",
            path: "M 740,340 L 770,330 L 795,340 L 785,380 L 788,398 L 770,410 L 740,405 L 720,385 L 715,360 L 740,340 Z",
            center: { x: 755, y: 370 },
            bounds: { minX: 715, maxX: 795, minY: 330, maxY: 410 }
        },
        "anhui": {
            id: "anhui",
            name: "安徽",
            shortName: "皖",
            type: "province",
            path: "M 690,340 L 720,350 L 740,340 L 715,360 L 720,385 L 740,405 L 730,430 L 705,445 L 680,430 L 665,400 L 670,370 L 690,340 Z",
            center: { x: 700, y: 390 },
            bounds: { minX: 665, maxX: 740, minY: 340, maxY: 445 }
        },
        "zhejiang": {
            id: "zhejiang",
            name: "浙江",
            shortName: "浙",
            type: "province",
            path: "M 770,410 L 788,398 L 795,420 L 790,450 L 775,470 L 755,475 L 735,460 L 730,430 L 740,405 L 770,410 Z",
            center: { x: 762, y: 440 },
            bounds: { minX: 730, maxX: 795, minY: 398, maxY: 475 }
        },
        "fujian": {
            id: "fujian",
            name: "福建",
            shortName: "闽",
            type: "province",
            path: "M 755,475 L 775,470 L 790,490 L 785,530 L 770,555 L 745,550 L 730,520 L 735,490 L 755,475 Z",
            center: { x: 760, y: 515 },
            bounds: { minX: 730, maxX: 790, minY: 470, maxY: 555 }
        },
        "jiangxi": {
            id: "jiangxi",
            name: "江西",
            shortName: "赣",
            type: "province",
            path: "M 705,445 L 730,430 L 735,460 L 755,475 L 735,490 L 730,520 L 710,545 L 680,530 L 665,495 L 675,460 L 705,445 Z",
            center: { x: 705, y: 485 },
            bounds: { minX: 665, maxX: 755, minY: 430, maxY: 545 }
        },
        "taiwan": {
            id: "taiwan",
            name: "台湾",
            shortName: "台",
            type: "province",
            path: "M 810,490 L 825,480 L 840,495 L 845,530 L 835,565 L 815,575 L 800,555 L 798,520 L 810,490 Z",
            center: { x: 822, y: 530 },
            bounds: { minX: 798, maxX: 845, minY: 480, maxY: 575 }
        },

        // ============ 华中地区 ============
        "henan": {
            id: "henan",
            name: "河南",
            shortName: "豫",
            type: "province",
            path: "M 620,330 L 645,340 L 670,320 L 680,290 L 690,315 L 710,335 L 690,340 L 670,370 L 680,400 L 660,420 L 625,415 L 600,390 L 595,355 L 620,330 Z",
            center: { x: 645, y: 365 },
            bounds: { minX: 595, maxX: 710, minY: 290, maxY: 420 }
        },
        "hubei": {
            id: "hubei",
            name: "湖北",
            shortName: "鄂",
            type: "province",
            path: "M 590,410 L 625,415 L 660,420 L 680,430 L 705,445 L 675,460 L 665,495 L 635,485 L 600,470 L 575,445 L 570,420 L 590,410 Z",
            center: { x: 630, y: 450 },
            bounds: { minX: 570, maxX: 705, minY: 410, maxY: 495 }
        },
        "hunan": {
            id: "hunan",
            name: "湖南",
            shortName: "湘",
            type: "province",
            path: "M 600,470 L 635,485 L 665,495 L 680,530 L 670,565 L 640,580 L 605,570 L 580,540 L 575,505 L 600,470 Z",
            center: { x: 625, y: 530 },
            bounds: { minX: 575, maxX: 680, minY: 470, maxY: 580 }
        },

        // ============ 华南地区 ============
        "guangdong": {
            id: "guangdong",
            name: "广东",
            shortName: "粤",
            type: "province",
            path: "M 605,570 L 640,580 L 680,575 L 720,580 L 745,600 L 740,630 L 710,650 L 670,660 L 630,650 L 600,625 L 585,595 L 605,570 Z",
            center: { x: 665, y: 615 },
            bounds: { minX: 585, maxX: 745, minY: 570, maxY: 660 }
        },
        "guangxi": {
            id: "guangxi",
            name: "广西",
            shortName: "桂",
            type: "autonomous",
            path: "M 520,545 L 550,555 L 580,540 L 605,570 L 585,595 L 600,625 L 580,650 L 545,660 L 505,645 L 480,615 L 485,575 L 520,545 Z",
            center: { x: 540, y: 600 },
            bounds: { minX: 480, maxX: 605, minY: 545, maxY: 660 }
        },
        "hainan": {
            id: "hainan",
            name: "海南",
            shortName: "琼",
            type: "province",
            path: "M 595,695 L 620,685 L 645,695 L 650,720 L 635,745 L 610,750 L 590,735 L 585,710 L 595,695 Z",
            center: { x: 618, y: 720 },
            bounds: { minX: 585, maxX: 650, minY: 685, maxY: 750 }
        },
        "hongkong": {
            id: "hongkong",
            name: "香港",
            shortName: "港",
            type: "sar",
            path: "M 725,630 L 735,625 L 745,632 L 742,645 L 732,648 L 722,642 L 725,630 Z",
            center: { x: 733, y: 637 },
            bounds: { minX: 722, maxX: 745, minY: 625, maxY: 648 }
        },
        "macau": {
            id: "macau",
            name: "澳门",
            shortName: "澳",
            type: "sar",
            path: "M 700,648 L 708,645 L 715,650 L 712,660 L 705,662 L 698,656 L 700,648 Z",
            center: { x: 706, y: 653 },
            bounds: { minX: 698, maxX: 715, minY: 645, maxY: 662 }
        },

        // ============ 西南地区 ============
        "sichuan": {
            id: "sichuan",
            name: "四川",
            shortName: "川",
            type: "province",
            path: "M 420,340 L 470,330 L 520,340 L 530,420 L 520,445 L 530,470 L 500,500 L 460,520 L 420,510 L 380,480 L 360,430 L 380,380 L 420,340 Z",
            center: { x: 450, y: 430 },
            bounds: { minX: 360, maxX: 530, minY: 330, maxY: 520 }
        },
        "guizhou": {
            id: "guizhou",
            name: "贵州",
            shortName: "黔",
            type: "province",
            path: "M 500,500 L 530,470 L 555,480 L 575,505 L 580,540 L 550,555 L 520,545 L 485,535 L 470,515 L 500,500 Z",
            center: { x: 530, y: 520 },
            bounds: { minX: 470, maxX: 580, minY: 470, maxY: 555 }
        },
        "yunnan": {
            id: "yunnan",
            name: "云南",
            shortName: "滇",
            type: "province",
            path: "M 380,500 L 420,510 L 460,520 L 470,515 L 485,535 L 520,545 L 485,575 L 480,615 L 445,640 L 400,650 L 360,620 L 340,570 L 355,530 L 380,500 Z",
            center: { x: 420, y: 575 },
            bounds: { minX: 340, maxX: 520, minY: 500, maxY: 650 }
        },
        "xizang": {
            id: "xizang",
            name: "西藏",
            shortName: "藏",
            type: "autonomous",
            path: "M 150,340 L 220,300 L 300,290 L 380,310 L 420,340 L 380,380 L 360,430 L 380,480 L 340,520 L 280,530 L 220,510 L 160,480 L 120,430 L 130,380 L 150,340 Z",
            center: { x: 270, y: 410 },
            bounds: { minX: 120, maxX: 420, minY: 290, maxY: 530 }
        },

        // ============ 西北地区 ============
        "shaanxi": {
            id: "shaanxi",
            name: "陕西",
            shortName: "陕",
            type: "province",
            path: "M 550,270 L 580,280 L 600,305 L 620,330 L 595,355 L 600,390 L 590,410 L 570,420 L 555,400 L 530,380 L 520,340 L 535,300 L 550,270 Z",
            center: { x: 565, y: 350 },
            bounds: { minX: 520, maxX: 620, minY: 270, maxY: 420 }
        },
        "gansu": {
            id: "gansu",
            name: "甘肃",
            shortName: "甘",
            type: "province",
            path: "M 360,200 L 420,190 L 480,200 L 520,170 L 520,200 L 550,270 L 535,300 L 520,340 L 470,330 L 420,340 L 380,310 L 340,280 L 320,240 L 340,210 L 360,200 Z",
            center: { x: 430, y: 270 },
            bounds: { minX: 320, maxX: 550, minY: 170, maxY: 340 }
        },
        "qinghai": {
            id: "qinghai",
            name: "青海",
            shortName: "青",
            type: "province",
            path: "M 280,290 L 320,280 L 360,290 L 400,310 L 380,380 L 360,430 L 320,420 L 280,400 L 240,370 L 230,330 L 250,300 L 280,290 Z",
            center: { x: 310, y: 360 },
            bounds: { minX: 230, maxX: 400, minY: 290, maxY: 430 }
        },
        "ningxia": {
            id: "ningxia",
            name: "宁夏",
            shortName: "宁",
            type: "autonomous",
            path: "M 520,240 L 545,250 L 550,270 L 535,300 L 520,310 L 500,295 L 495,265 L 520,240 Z",
            center: { x: 523, y: 275 },
            bounds: { minX: 495, maxX: 550, minY: 240, maxY: 310 }
        },
        "xinjiang": {
            id: "xinjiang",
            name: "新疆",
            shortName: "新",
            type: "autonomous",
            path: "M 80,120 L 160,90 L 260,85 L 360,95 L 420,90 L 450,80 L 420,140 L 470,160 L 420,190 L 360,200 L 340,210 L 320,240 L 280,260 L 230,270 L 180,260 L 130,230 L 90,190 L 70,150 L 80,120 Z",
            center: { x: 260, y: 170 },
            bounds: { minX: 70, maxX: 470, minY: 80, maxY: 270 }
        }
    }
};

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ChinaMapData;
}
