
const el = document.getElementById('app');
const sightStack = document.getElementById('sightStack');
const stack = document.getElementById('stack');
const easeMaterial = CubicBezier.config(.76,.01,0,1);

var atSightArr = [];
var stackArr = [];

var cards = [
    {
        id: 1,
        className : 'bg-rojo'
    },
    {
        id: 2,
        className : 'bg-verde'
    },
    {
        id: 3,
        className : 'bg-amarillo'
    },                
    {
        id: 4,
        className : 'bg-naranja'
    },
    {
        id: 5,
        className : 'bg-purpura'
    }
]

/* start animate events */

const animationElement = {
    elementSetPosition : function (id) {
        let card = document.querySelector(`#card_${id}`);
        if(stackArr.length > 1){
            TweenMax.set(card, {x: 10, y: 10});
            if(stackArr.length > 2){
                TweenMax.set(card, {autoAlpha: 0, x: 30, y: 30});
            }
        }
    },
    elementEnterAnimation : function (content, id) {

        let tl = new TimelineMax();
        let card = content.querySelector(`#card_${id}`);
        let nextCard = card.nextSibling;
        let prevCard = card.previousSibling;

        if(content === stack){
            tl.to(card, .4, {x: 0, y: 0, ease: easeMaterial}, 0);
            if(stackArr.length > 1) tl.to(nextCard, .4, {autoAlpha: 1, x: 10, y: 10, ease: easeMaterial}, 0.3);
        }

        if(content === sightStack) {
            if(atSightArr.length > 2){
                tl.to(prevCard.previousSibling, .4, {autoAlpha: 0, ease: easeMaterial}, 0);
            }
            tl.to(prevCard, .4, {x: 10, y: 10, ease: easeMaterial}, 0);
        }
    },
    elementLeaveAnimation : function (content, id) {
        let tl = new TimelineMax();
        let card = content.querySelector(`#card_${id}`);
        let nextCard = card.nextElementSibling;
        let prevCard = card.previousElementSibling;

        if(content === stack){
            console.log(id, nextCard);
            tl.to(nextCard, .4, {x: 10, y: 10, ease: easeMaterial});
        }

        if(content === sightStack){
            tl.to(card, .4, {x: 0, y: 0, ease: easeMaterial}, 0);
        }
    }
}

/* template element */

function createNode (id, className) {
    let node = `<div id="card_${id}" class="card ${className}"></div>`;
    return node;
}

cards.map(card => {
    let arrName = "stackArr";
    let domEl = "stack";
    if(atSightArr.length === 0){
        arrName = "atSightArr";
        domEl = "sightStack";
    }
    eval(arrName).push(card.id);
    let node = createNode(card.id, card.className);
    eval(domEl).insertAdjacentHTML('beforeend', node);
    if (domEl === "stack"){ animationElement.elementSetPosition(card.id); }
});

// set fixed elements

function fixZIndexes() {
    atSightArr.map((id, index) => {
        let card = document.getElementById("card_"+id);
        card.style.zIndex = 100 - index;      
    })
    stackArr.map((id, index) => {
        let card = document.getElementById("card_"+id);
        card.style.zIndex = 100 - index;
    })
}

fixZIndexes();

function fixStackShadows() {
    let isSightStaked = (atSightArr.length > 1) ? '+=stacked' : '-=stacked'
    TweenMax.to(sightStack, .1, {css: {className: isSightStaked}});

    let isStackStaked = (stackArr.length > 1) ? '+=stacked' : '-=stacked'
    TweenMax.to(stack, .1, {css: {className: isStackStaked}});
}


// fixStackShadows();

function change (id, direction) {
    if (direction === "up" && stackArr.length > 1) {
        let card = document.getElementById(`card_${id}`);

        stack.style.zIndex = 0;
        sightStack.style.zIndex = 1;
        let rect = card.getBoundingClientRect();
        
        if (atSightArr.indexOf(id) == -1) {
            let stackedId = stackArr.shift(stackArr.indexOf(id));
            atSightArr.push(stackedId);
            sightStack.appendChild(card);

            TweenMax.set(card, {x: 0, y: 0, zIndex: 999});
            TweenMax.set(el, {css: {className: '+=pointer-events'}});

            var newRect = card.getBoundingClientRect();

            // animations
            console.log(card.nextSibling);
            animationElement.elementEnterAnimation(stack, stackArr[0]);
            animationElement.elementEnterAnimation(sightStack, stackedId);
            // 
            TweenMax.from(card, .6, {
                x: rect.left - newRect.left,
                y: rect.top - newRect.top,
                ease: easeMaterial,
                onComplete: function() {
                    fixZIndexes();
                    TweenMax.set(el, {css: {className: '-=pointer-events'}});
                }
            });
        }
    }
    if (direction === "down" && atSightArr.length > 1) {
        console.log("down::::");
        let card = document.getElementById(`card_${id}`);
        stack.style.zIndex = 1;
        sightStack.style.zIndex = 0;
        let rect = card.getBoundingClientRect();
        console.log(rect);
        let classes = card.classList;
        if (stackArr.indexOf(id) == -1) {
            let stackedId = atSightArr.pop(stackArr.indexOf(id));
            stackArr.unshift(stackedId);
            stack.insertAdjacentElement('afterbegin', card);

            TweenMax.set(card, {x:0, y:0, zIndex: 999});

            var newRect = card.getBoundingClientRect();

            /* leave animations */
            console.log(stackArr);
            animationElement.elementLeaveAnimation(stack, stackArr[0]);
            animationElement.elementLeaveAnimation(sightStack, atSightArr[0]);

            TweenMax.from(card, .6, {
                x: rect.left - newRect.left,
                y: rect.top - newRect.top,
                ease: easeMaterial,
                onComplete: fixZIndexes
            });
        }
    }
}


 
let hm = new Hammer(el);

hm.get('swipe').set({ direction: Hammer.DIRECTION_VERTICAL });
hm.on("swipeup", function (e) {
    change(stackArr[0], "up");

    console.log('arriba', atSightArr);
    console.log('abajo', stackArr);


});


hm.on("swipedown", function (e) {
    change(atSightArr[atSightArr.length - 1], "down");
    console.log('arriba', atSightArr);
    console.log('abajo', stackArr);
});





