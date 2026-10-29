const sharp=require('sharp');const b='../_backup_original_assets/';const o='../site/assets/img/';
(async()=>{
 const m=await sharp(b+'new-logo-source.webp').metadata();console.log('logo',m.width,m.height,m.hasAlpha);
 await sharp(b+'new-logo-source.webp').png().toFile(o+'brand/logo-new-original.png');
 await sharp(b+'new-logo-source.webp').resize(640).webp({quality:90}).toFile(o+'brand/logo.webp');
 await sharp(b+'new-logo-source.webp').resize(640).png().toFile(o+'brand/logo-640.png');
 await sharp(b+'new-logo-source.webp').resize(180).png().toFile(o+'brand/apple-touch-icon.png');
 await sharp(b+'new-logo-source.webp').resize(48,48).png().toFile(o+'brand/favicon-48.png');
 await sharp(b+'new-logo-source.webp').resize(1200,630,{fit:'contain',background:'#000'}).jpeg({quality:85}).toFile(o+'brand/og-image.jpg');
 const books=[['book-1-president-is-missing.png','president-is-missing'],['book-2-bristol-bombers.webp','bristol-bombers'],['book-3-beyond-the-snake.webp','beyond-the-snake'],['book-4-extraordinary-story.png','extraordinary-story']];
 for(const [f,n] of books){const mm=await sharp(b+f).metadata();console.log(n,mm.width,mm.height);
  await sharp(b+f).resize({width:Math.min(mm.width,800)}).webp({quality:85}).toFile(o+'books/'+n+'.webp');
  await sharp(b+f).resize({width:Math.min(mm.width,800)}).jpeg({quality:85}).toFile(o+'books/'+n+'.jpg');}
 const {data}=await sharp(b+'new-logo-source.webp').raw().toBuffer({resolveWithObject:true});
 // sample orange: find most saturated bright pixel avg
 let best=null;for(let i=0;i<data.length;i+=3*50){const r=data[i],g=data[i+1],bl=data[i+2];if(r>230&&g>140&&g<190&&bl<40){best=[r,g,bl];break;}}console.log('orange',best);
})();
