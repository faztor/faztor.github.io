const easeMaterial = CubicBezier.config(.76,.01,0,1);

const state = {
    el : {
        id: null,
        target: null,
        distance: null,
        limit: 25
    },
    touch: {
        shouldMove: false,
        moving: false,
        sliding: false,
        movingClass: 'is-moving',
        position: {
            start: {
                x: null,
                y: null
            },
            current: {
                x: null,
                y: null
            }
        },
        mouseStartY: 0,
        mouseStartX: 0,
        mouseCurrentY: null,
        mouseCurrentX: null,
        displacement: null,
        posY: null,
        posX: null,
        startTime: null,
        threshold: 150,
        restraint: 100,
    }
}

let vars = {
    el: document.getElementById('app'),
    cards: [],
    animations: {
        riseUp: {y: 0, ease: easeMaterial},
        slideDown: {y: 4, ease: easeMaterial},
        appear: {autoAlpha: 1, y: 4, ease: easeMaterial},
        hide: {autoAlpha: 0, ease: easeMaterial},
    },
    sightStack: {
        el: document.getElementById('sightStack'),
        arr: [],
    },
    stack: {
        el: document.getElementById('stack'),
        arr: [],
    }
}

vars.cards = [
    {
        id: 1,
        className : 'bg-purpura'
    },
    {
        id: 2,
        className : 'bg-amarillo'
    },
    {
        id: 3,
        className : 'bg-verde'
    },                
    {
        id: 4,
        className : 'bg-rojo'
    },
    {
        id: 5,
        className : 'bg-marron'
    }
]

function getCard(id)
{
    return document.getElementById(`card_${id}`);
}

/* start animate events */

const animationElement = {
    elementSetPosition : function (arr, id) {
        console.log("colocando elemento::::", id)
        let card = document.querySelector(`#card_${id}`);
        TweenMax.set(card, {x: 0, y: 0});
        if(arr.length > 1){
            TweenMax.set(card, {x: 0, y: 4});
            if(arr.length > 2){
                TweenMax.set(card, {autoAlpha: 0, x: 0, y: 30});
            }
        }
    },
    elementAnimation : function (direction, id) {
        direction = direction === "up" ? "up" : "down";

        let timeline = new TimelineMax();

        let card = document.getElementById(`card_${id}`);
        let parent = card.parentElement;
        let parentId = parent.id;        

        let cardAnimationNames = ["riseUp", "slideDown"];
        let otherAnimationNames = ["appear", "hide"];

        if (direction === "down")
        {
            cardAnimationNames = cardAnimationNames.reverse();
            otherAnimationNames = otherAnimationNames.reverse();
        }

        let animationIndex = parentId == "stack" ? 0 : 1;
        let targetStack = direction == "up" ? "sightStack" : "stack";

        let cardAnimation = vars.animations[cardAnimationNames[animationIndex]];
        let otherAnimation = vars.animations[otherAnimationNames[animationIndex]];

        console.log("CARD ANIMATION:::::", cardAnimationNames[animationIndex])
        console.log("OTHER ANIMATION:::::", otherAnimationNames[animationIndex])

        let arr = vars[parentId].arr;

        let otherCard = arr.length > 1 ? document.getElementById(`card_${arr[1]}`) : null;

        if (parentId == targetStack)
        {
            card = otherCard;
            otherCard = arr.length > 2 ? document.getElementById(`card_${arr[2]}`) : null;
        }

        timeline.to(card, .4, cardAnimation, 0);

        if(otherCard !== null)
        {
            timeline.to(otherCard, .4, otherAnimation, 0);
        }
         
    }
}

/* template element */

function createNode (id, className, container) {
    container = container === null ? "" : container;
    let node = `<div id="card_${id}" class="${container} card ${className}"></div>`;
    return node;
}

vars.cards.map((card, index) => {
    let container = index === 0 ? "at-sight" : index === 1 ? "at-stack" : null;
    let name = "stack";
    if(vars.sightStack.arr.length === 0){
        name = "sightStack";
    }
    vars[name].arr.push(card.id);
    let node = createNode(card.id, card.className, container);
    vars[name].el.insertAdjacentHTML('beforeend', node);
    animationElement.elementSetPosition(vars[name].arr, card.id);
});

document.querySelectorAll('.card').forEach(card => {
    card.addEventListener('touchstart', onTouchStart, false);
    card.addEventListener('touchmove', onTouchMove, false);
    card.addEventListener('touchend', onTouchEnd, false);
})

// set fixed elements

function fixZIndexes() {
    ["sightStack", "stack"].map(name => {
        vars[name].arr.map((id, index) => {
            let card = document.getElementById("card_"+id);
            card.style.zIndex = 100 - index;
        })
    });
}

fixZIndexes();

function change (id, direction) {
    if (direction === "up" && vars.stack.arr.length > 1 || direction !== "up" && vars.sightStack.arr.length > 1) {
        let origin = direction == "up" ? "stack" : "sightStack";
        let target = direction == "up" ? "sightStack" : "stack";

        let originArr = vars[origin].arr;
        let targetArr = vars[target].arr;

        let card = document.getElementById(`card_${id}`);

        vars[origin].el.style.zIndex = 0;
        vars[target].el.style.zIndex = 1;

        let rect = card.getBoundingClientRect();
        
        if (vars[target].arr.indexOf(id) == -1) {
            let stackedId = vars[origin].arr.shift();
            vars[target].arr.unshift(stackedId);
            vars[target].el.insertAdjacentElement('afterbegin', card);

            TweenMax.set(card, {y: 0, zIndex: 999});
            TweenMax.set(vars.el, {css: {className: '+=pointer-events'}});

            var newRect = card.getBoundingClientRect();

            // animations
            animationElement.elementAnimation(direction, vars[target].arr[0]);
            animationElement.elementAnimation(direction, vars[origin].arr[0]);
            
            TweenMax.from(card, 1.5, {
                x: rect.left - newRect.left,
                y: rect.top - newRect.top,
                ease: Elastic.easeOut.config(0.75, 0.75),
                onComplete: function() {
                    fixZIndexes();
                    TweenMax.set(vars.el, {css: {className: '-=pointer-events'}});
                }
            });
        }
    }
}

function onTouchStart (e) {
    state.touch.position.start.x = state.touch.position.current.x = e.touches[0].screenX;
    state.touch.position.start.y = state.touch.position.current.y = e.touches[0].screenY;

    console.log("INICIO EN:::::", state.touch.position.start);
    
    state.el.id = e.target.id;

    state.touch.startTime = new Date().getTime();

    let rect = e.target.getBoundingClientRect();
    let distance = Math.floor(rect.height);

    console.log("card height", distance)

    state.el.distance = distance;
    state.touch.moving = true;

    // modificando los z index de los contenedores
    positionContainers(e);

    document.removeEventListener('touchstart', onTouchStart);
}

function onTouchMove (e) {

    let parentId = e.target.parentElement.id;
    let cardId = parseInt(e.target.id.replace("card_", ""));
    let isLastElement = vars[parentId].arr.length == 1;

    if (parentId == "sightStack" && isLastElement)
    {
        state.touch.moving = false;
    }

    if(state.touch.moving){
        state.touch.position.current.x = e.touches[0].screenX;
        state.touch.position.current.y = e.touches[0].screenY;

        let direction = isMovingUp(state.touch.position.start, state.touch.position.current) ? "up" : "down";

        state.touch.displacement = state.touch.position.current.y - state.touch.position.start.y;
        let absDisplacement = Math.abs(state.touch.displacement);

        if (
            isLastElement && absDisplacement >= 10 ||
            !isLastElement && parentId == "sightStack" && direction == "up" && absDisplacement >= 10 ||
            !isLastElement && parentId == "stack" && direction == "down" && absDisplacement >= 10
        )
        {
            state.touch.moving = false;
        }

        animateCard();

        state.touch.shouldMove = state.el.distance * 0.20 <= absDisplacement;
    }
    document.removeEventListener('touchmove', onTouchMove);
}

function isMovingUp(start, current)
{
    return current.y < start.y;
}

function onTouchEnd (e) {
    let direction = isMovingUp(state.touch.position.start, state.touch.position.current) ? "up" : "down";
    

    if(state.touch.shouldMove && !state.touch.sliding){
        state.touch.sliding = true;

        let parentId = e.target.parentElement.id;

        if (parentId == "stack" && direction == "up") {
            change(vars.stack.arr[0], "up");
        }
        if (parentId != "stack" && direction == "down") {
            change(vars.sightStack.arr[0], "down");
        }
        document.removeEventListener('touchend', onTouchEnd);
        state.touch.moving = false;
        state.touch.sliding = false;
        state.touch.shouldMove = false;
    }

    state.touch.moving = false;
    state.touch.sliding = false;
    
    if(!state.touch.moving){
        returnCard();
    }

    document.removeEventListener('touchend', onTouchEnd);
}   


function animateCard () {
    let el = document.getElementById(state.el.id);
    TweenMax.set(el, {y: state.touch.displacement});
}

function returnCard () {
    let el = document.getElementById(state.el.id);
    state.touch.posY = 0;
    state.touch.mouseStartY = 0;
    TweenMax.to(el, 1, {
        y: 0,
        ease: Elastic.easeOut.config(0.75, 0.4)
    });

}

function positionContainers (e) {
    let parentId = e.target.parentElement.id;
    let parent = vars[parentId].el;
    let other = vars[parentId == "stack" ? "sightStack" : "stack"].el;
    parent.style.zIndex = "999";
    other.style.zIndex = "0";
}


function dragGetDirection (e) {
    let elapsedTime = new Date().getTime() - state.touch.startTime;

    if(elapsedTime <= state.el.distance){
        if(Math.abs(state.touch.mouseCurrentY) >= state.touch.threshold){
            let direction = (state.touch.posY < 0 ) ? 'up' : 'down'

            return direction;
        }
    }
}


