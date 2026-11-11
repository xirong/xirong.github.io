// NASA 戈达德土星卫星资料：https://nssdc.gsfc.nasa.gov/planetary/factsheet/saturniansatfact.html
// 不规则卫星的直径为近似值，真实外形不是球体。
window.SATURN_MOON_DETAILS = [
    ['一','Mimas',396.4,0.9424,'有一个巨大的赫歇尔撞击坑，看起来有点像星球大战里的死星。'],
    ['三','Tethys',1062,1.8878,'是一颗明亮的冰卫星，表面有巨大的奥德修斯撞击坑。'],
    ['四','Dione',1123,2.7369,'是一颗冰卫星，表面有明亮的冰崖和许多撞击坑。'],
    ['七','Hyperion',270,21.2766,'外形不规则，表面布满深坑，像一块海绵。它自转的方向也会不断变化。'],
    ['八','Iapetus',1469,79.3302,'一面很亮，一面很暗，赤道附近还有一条高高的山脊。'],
    ['九','Phoebe',213,548,'是一颗远离土星的逆行卫星，轨道方向与土星自转相反。']
].map(([number,nameEN,diameter,orbitPeriod,description])=>({
    key:nameEN.toLowerCase(), nameCN:`土卫${number}`, nameEN, diameter, orbitPeriod, description
}));
