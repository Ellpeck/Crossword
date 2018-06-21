const debug = true;
const width = 15;
const height = 15;
const tries = 1000;

$(function(){
    const crossword = $('#crossword');
    const categories = Object.getOwnPropertyNames(data);

    $('#generate').on('click', function(){
        console.log('########## Generating ##########');

        crossword.html('');

        for(let y = 0; y < height; y++){
            crossword.append('<tr>');

            for(let x = 0; x < width; x++){
                crossword.append('<td><input id="cw'+x+'-'+y+'" class="crossword-input" maxlength="1" disabled/></td>')
            }

            crossword.append('</tr>');
        }

        const usedWords = [];

        for(let words = 0; words < tries; words++){
            let categoryName = categories[Math.floor(Math.random()*categories.length)];
            let category = data[categoryName];

            let word;
            do{
                word = category[Math.floor(Math.random()*category.length)];
            }
            while(usedWords.indexOf(word) >= 0);

            if(checkPos(categoryName, word, 1, 1, true)){
                usedWords.push(word);
            }
        }

        console.log('########## Done ##########');

        function checkPos(desc, word, x, y, firstWord){
            let field = $('#cw'+x+'-'+y);

            let c = field.attr('letter');
            if(c === undefined){
                if(firstWord){
                    let vertical = Math.random() >= 0.5;
                    if(setWord(desc, word, x, y, x, y, vertical, true)){
                        setWord(desc, word, x, y, x, y, vertical, false);
                        return true;
                    }
                }
                else{
                    console.log('Found an empty space for word '+word+' at '+x+' '+y+' but it is not the first one, ignoring');
                }
            }
            else{
                let currVert = field.attr('vertical') === 'true';

                let index = word.indexOf(c);
                if(index >= 0){
                    let vertical = !currVert;
                    let theX = x-(vertical ? 0 : index);
                    let theY = y-(vertical ? index : 0);

                    if(setWord(desc, word, theX, theY, x, y, vertical, true)){
                        setWord(desc, word, theX, theY, x, y, vertical, false);
                        return true;
                    }
                    else{
                        console.log('Could not set word '+word+' at '+theX+' '+theY);
                    }
                }

                if(currVert){
                    y += 1;
                }
                else{
                    x += 1;
                }

                if(x >= width || y >= height){
                    console.log('Cannot set word '+word+' into crossword because there was no space found');
                }
                else{
                    return checkPos(desc, word, x, y, false);
                }
            }
            return false;
        }

        function setWord(desc, word, x, y, startX, startY, vertical, test){
            if(test){
                if(x <= 0 || y <= 0){
                    return false;
                }
            }

            let sameLetterAmount = 0;

            let field = $('#cw'+(x-(vertical ? 0 : 1))+'-'+(y-(vertical ? 1 : 0)));
            if(test){
                if(field.attr('letter') !== undefined || field.attr('word') !== undefined){
                    return false;
                }
            }
            else{
                field.attr('word', word);
                field.val(vertical ? "v" : ">");
                field.attr('title', desc);
            }

            for(let i = 0; i <= word.length; i++){
                let theX = x+(vertical ? 0 : i);
                let theY = y+(vertical ? i : 0);

                if(test){
                    if(theX >= width || theY >= height){
                        return false;
                    }
                    else{
                        if(vertical ? (theY !== startY) : (theX !== startX)){
                            let error = false;

                            for(let add = -1; add <= 1; add++){
                                let theField = $('#cw'+(theX+(vertical ? add : 0))+'-'+(theY+(vertical ? 0 : add)));

                                if(add !== 0 || theField.attr('word') === undefined){
                                    let c = theField.attr('letter');
                                    if(c !== undefined){
                                        if(i >= word.length){
                                            return false;
                                        }
                                        else if(add !== 0){
                                            error = !error;
                                        }
                                        else{
                                            if(c !== word.charAt(i)){
                                                return false;
                                            }
                                            else{
                                                sameLetterAmount++;
                                                if(sameLetterAmount >= word.length){
                                                    return false;
                                                }
                                            }
                                        }
                                    }
                                }
                                else{
                                    return false;
                                }
                            }

                            if(error){
                                return false;
                            }
                        }
                    }
                }
                else if(i < word.length){
                    let theField = $('#cw'+theX+'-'+theY);
                    let theC = word.charAt(i);

                    theField.prop('disabled', false);
                    theField.attr('letter', theC);
                    theField.attr('vertical', String(vertical));

                    if(debug){
                        theField.attr('placeholder', theC.toUpperCase());
                    }
                }
            }

            if(!test){
                console.log('Set '+(vertical ? 'vertical' : 'horizontal')+' word '+word+' at '+x+' '+y)
            }

            return true;
        }
    });
});