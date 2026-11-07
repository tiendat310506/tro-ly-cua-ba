const {normalizeAnswer:N}=require('./norm.js');let f=0;
const C=(k,i,e)=>{const o=N(i,k);console.log((o===e?'✓':'✗')+` [${k}] "${i}" → "${o}"`+(o===e?'':` (muốn "${e}")`));if(o!==e)f++};
C('Giá','một trăm năm mươi nghìn','150k');C('Giá','150 nghìn','150k');C('Giá','150.000','150k');C('Giá','trăm rưỡi','150k');
C('Giá','hai trăm','200k');C('Giá','một trăm hai lăm nghìn','125k');C('Giá','99 nghìn','99k');C('Giá','giá 180k','180k');
C('Giá','một triệu hai','1tr2');C('Giá','250.000 đồng','250k');C('Giá','hai trăm năm chục','250k');C('Giá','một trăm tám','180k');
C('Size','55 ký đến 65 ký','55kg đến 65kg');C('Size','năm lăm ký đến sáu lăm ký','55kg đến 65kg');C('Size','từ 45 đến 60 ký','Từ 45kg đến 60kg');
C('Size','free size','Freesize');C('Size','size em với size eo','Size M, size L'.replace(', ',' với '));
C('Mã','không có','Không có');C('Mã','hông có','Không có');C('Mã','a bê 12','AB12');C('Mã','mã số 205','205');C('Mã','không','Không có');
C('Màu','đỏ và xanh','Đỏ, xanh');C('Màu','có màu đen, màu trắng với màu be','Đen, trắng, be');
C('Tên','đầm voan hoa','Đầm voan hoa');C('Tên','áo năm tà','Áo năm tà');
console.log(f?f+' lỗi':'TẤT CẢ ĐẠT')
