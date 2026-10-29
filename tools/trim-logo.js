const sharp=require('sharp');
(async()=>{
 const s='../_backup_original_assets/new-logo-source.webp',o='../site/assets/img/brand/';
 const t=await sharp(s).trim({background:'#000000',threshold:30}).toBuffer({resolveWithObject:true});
 console.log(t.info.width,t.info.height,t.info.trimOffsetLeft,t.info.trimOffsetTop);
 // add small uniform black padding so nothing touches edge
 const pad=Math.round(t.info.width*0.03);
 const buf=await sharp(t.data).extend({top:pad,bottom:pad,left:pad,right:pad,background:'#000000'}).toBuffer();
 await sharp(buf).resize({width:720}).webp({quality:90}).toFile(o+'logo-trimmed.webp');
 await sharp(buf).resize({width:720}).png().toFile(o+'logo-trimmed.png');
 await sharp(buf).resize({width:360}).webp({quality:90}).toFile(o+'logo-trimmed-360.webp');
 const m=await sharp(buf).metadata();console.log('final',m.width,m.height);
 await sharp(s).resize(32,32).png().toFile(o+'favicon-32.png');
})();
