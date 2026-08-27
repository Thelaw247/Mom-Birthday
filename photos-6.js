(()=>{function photo(path){var request=new XMLHttpRequest();request.open('GET',path,false);request.send();return 'data:image/webp;base64,'+request.responseText.trim()}window.__BIRTHDAY_PHOTOS__=Object.assign(window.__BIRTHDAY_PHOTOS__||{},{p16:photo('assets/photos/p16.webp.b64'),p17:photo('assets/photos/p17.webp.b64'),p18:photo('assets/photos/p18.webp.b64')});

const photoNote=document.querySelector('.photos .section-copy p:last-of-type');
if(photoNote&&photoNote.textContent.includes('unieke foto')) photoNote.remove();

const letter=document.querySelector('#letterDialog .letter-body');
if(letter){
letter.innerHTML=`
<p>Mamma, ek weet ek sê dit nie altyd nie, maar ek sien hoe hard jy werk. Ek sien hoeveel jy vir ons doen, en ook hoeveel goed jy net vat en aangaan sonder om daarvan ’n groot ding te maak.</p>
<p>Ek sien ook wat die werk aan jou doen. Jou hande raak al hoe slegter, jy is moeg, en daar is altyd iets wat gedoen moet word. Tog kom jy huis toe en behandel ons nog steeds goed. Jy vat nie alles wat sleg gegaan het in die dag en haal dit op ons uit nie. Ek dink dit is een van die goed van jou wat ek die meeste respekteer.</p>
<p>Jy het vir elf jaar my stoei ondersteun. Die laaste drie jaar was die mal deel, toe jy my drie of vier keer ’n week omtrent ’n uur stad toe moes ry en weer terug. Voor dit was dit baie nader, maar jy was nog steeds daar. En dit was nie net my sport nie. Jy was daar vir Richter se hokkie, vir Joshua en Caleb, en vir al die ander goed ook.</p>
<p>Wat vir my uitstaan, is hoe jy bly dink wanneer dinge skeefloop. Jy raak nie net kwaad en maak dit almal se probleem nie. Jy luister, jy dink, en dan probeer jy uitfigure wat die regte ding is om te doen. Ek weet ek waardeer dit nie altyd genoeg wanneer dit gebeur nie, maar ek sien dit.</p>
<p>Nou begin ek universiteit en elektriese ingenieurswese, en ek weet ek het nie net self hier uitgekom nie. Daar is baie van wat jy gedoen het wat my tot hier gekry het. Al die ry, die tyd, die ondersteuning en die kere wat jy net aangehou het.</p>
<p>Ek hoop jy kry ook die goed wat jy nog vir jouself wil hê. Ek hoop jy kry jou kans met die RCMP en speurwerk, en wat ook al jou volgende ding is. Jy het baie van jou lewe in ons gesit. Ek hoop die volgende deel van jou lewe het ook baie wat net vir jou is.</p>
<p>Gelukkige 38ste verjaarsdag, Mamma. Dankie vir alles. Ek is baie lief vir jou.</p>`;
}
})();