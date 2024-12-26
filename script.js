var ElementBorderWidth;
var ParallelInterval;
var WireTopMargin;
var WireWidth;

var currentPosition = null;

function round(number, a) {
    if (a > 0) {
        return (number).toFixed(a);
    } else if (a == 0) {
        return Math.round(number);
    } else {
        let r = number % Math.pow(10, -a);
    
        if (r / Math.pow(10, -a) > 0.5) {
            return number - number % Math.pow(10, -a);
        } else {
            return number - number % Math.pow(10, -a) + 1;
        }
    }
}
  
function digitnumber(number) {
    let a = 0;
    if (number == 0) {
        return 0;
    }
    number = Math.abs(number);
    if (number > 1) {
        while (number > 10) {
            number /= 10;
            a++;
        }
        return a;
    }
    while (number < 1) {
        number *= 10;
        a--;
    }
    return a;
}
  
function to_scientific_notation(number) {
    if (number === Infinity) {
        return 'беск';
    }
    exponent = digitnumber(number);
    if (exponent > 2 || exponent < -2) {
        number = number * Math.pow(10, -exponent);
    }
  
    let string = round(number, 2);
    if (exponent > 2 || exponent < -2) {
        string += ' x 10^(' + exponent + ')';
    }
    return string;
}
  

class Resistor {
    constructor(resistance) {
        this.resistance = resistance;
    }

    get voltage() {
        return 0;
    }

    get amperage() {
        return 0;
    }

    get type() { return 'resistor'; }

    Construct(indexStack) {
        const node = document.createElement('div');
        node.classList.add('resistor');
        node.classList.add('electric-element');
        node.innerHTML = "<span>🎚 " + this.resistance + " Ом" + "</span>";
        node.title = 'Удалить?';

        node.addEventListener('click', (e) => {
            const confirmation = confirm('Вы уверены, что хотите удалить этот элемент?');

            if (confirmation) {
                removeElectricElement(indexStack.join('-'));
                updateCircuit();
            }
        });

        return node;
    }

    Clone() {
        return new Resistor(this.resistance);
    }

    Calculate() {
        return [this.resistance, 0];
    }

    Visit() { }
}

class Battery {
    constructor(emf, resistance) {
        this.resistance = resistance;
        this.emf = emf;
    }

    get voltage() {
        return this.emf;
    }

    get amperage() {
        return this.emf / this.resistance;
    }

    get type() { return 'battery'; }

    Construct(indexStack) {
        const node = document.createElement('div');
        node.classList.add('battery');
        node.classList.add('electric-element');
        node.innerHTML = "<span>🔋 " + this.emf + " В; " + this.resistance + " Ом; " + "</span>";
        node.title = 'Удалить?';

        node.addEventListener('click', (e) => {
            const confirmation = confirm('Вы уверены, что хотите удалить этот элемент?');

            if (confirmation) {
                removeElectricElement(indexStack.join('-'));
                updateCircuit();
            }
        });

        return node;
    }

    Clone() {
        return new Battery(this.emf, this.resistance);
    }

    Calculate() {
        return [this.resistance, this.emf];
    }

    Visit() { }
}

class Ammeter {
    constructor() {
        this.resistance = 0;
        this.node = null;
        this.current = null
    }

    get voltage() {
        return 0;
    }

    get amperage() {
        return 0;
    }

    get type() { return 'ammeter'; }

    Calculate() {
        return [this.resistance, this.voltage];
    }

    Construct(indexStack) {
        const node = document.createElement('div');
        node.classList.add('ammeter');
        node.classList.add('electric-element');
        node.innerHTML = "<span>⏲️ " + (this.current === null ? "?" : to_scientific_notation(this.current)) + " А</span>";
        this.node = node;
        node.title = 'Удалить?';

        node.addEventListener('click', (e) => {
            const confirmation = confirm('Вы уверены, что хотите удалить этот элемент?');

            if (confirmation) {
                removeElectricElement(indexStack.join('-'));
                updateCircuit();
            }
        });

        return node;
    }

    Visit(current, voltage) {
        this.current = current;
        if (this.node === null) {
            return;
        }

        this.node.innerHTML = "<span>⏲️ " + to_scientific_notation(current) + " А" + "</span>";
    }
}

class Voltmeter {
    constructor() {
        this.resistance = Infinity;
        this.node = null;
        this.voltage = null;
    }

    get amperage() {
        return 0;
    }

    get type() { return 'voltmeter'; }

    Calculate() {
        return [this.resistance, 0];
    }

    Construct(indexStack) {
        const node = document.createElement('div');
        node.classList.add('ammeter');
        node.classList.add('electric-element');
        node.innerHTML = "<span>⏲️ " + (this.voltage === null ? "?" : to_scientific_notation(this.voltage)) + " В</span>";
        this.node = node;
        node.title = 'Удалить?';

        node.addEventListener('click', (e) => {
            const confirmation = confirm('Вы уверены, что хотите удалить этот элемент?');

            if (confirmation) {
                removeElectricElement(indexStack.join('-'));
                updateCircuit();
            }
        });

        return node;
    }

    Visit(current, voltage) {
        this.voltage = voltage;
        if (this.node === null) {
            return;
        }

        this.node.innerHTML = "<span>⏲️ " + to_scientific_notation(voltage) + " В" + "</span>";
    }
}

function placeholderFactory(index) {
    const node = document.createElement('div');
    node.classList.add('circuit-element');
    node.classList.add('placeholder');

    const n = document.createElement('div');
    n.classList.add('placeholder-visual')

    node.appendChild(n);
    node.setAttribute('indexincircuit', index);
    if (index == currentPosition) {
        node.classList.add('selected-placeholder');
    }
    n.setAttribute('indexincircuit', index);

    return node;
}

function parallelGroupsKnotFactory(position=null, height=0) {
    const node = document.createElement('div');
    node.classList.add('parallelgroupknot');
    if (position != null) {
        node.classList.add(position + 'knot');
    }
    node.style.height = height + 'px';

    return node;
}


function fillerFactory(width) {
    const node = document.createElement('div');
    node.classList.add('circuit-element');
    node.classList.add('filler');

    const n = document.createElement('div');
    n.classList.add('filler-visual')

    node.appendChild(n);

    node.style.width = width + 'px';

    return node;
}

function parallelGroupManagerFactory(index) {
    const node = document.createElement('div');
    node.classList.add('parallelgroupdeleter');

    node.innerHTML = '<span>❌</span>';
    node.title = 'Удалить часть цепи?'

    node.addEventListener('click', (event) => {
        event.preventDefault();

        const confirmation = confirm('Вы уверены, что хотите удалить эту часть цепи? Вместе удалятся и все элементы этой цепи!');

        if (confirmation) {
            removeElectricElement(index);
            updateCircuit();
        }
    });

    return node;
}

function parallelGroupAdderFactory(index) {
    const node = document.createElement('div');
    node.classList.add('parallelgroupadder');

    node.innerHTML = '<span>🖍</span>';
    node.title = 'Добавить параллель?'

    node.addEventListener('click', (event) => {
        event.preventDefault();

        let [scope, i] = getCircuitElementsArray(index);

        scope[i].groups.splice(scope.length - 1, 0, new CircuitPart());

        updateCircuit();
    });

    return node;
}

class CircuitPart {
    constructor(elements=null) {
        if (elements === null) {
            elements = [];
        }

        this.elements = elements;
        this.resistance = null;
        this.voltage = null;
        this.amperage = null;
    }

    get type() { return 'circuitpart'; }

    Insert(index, element) {
        this.elements.splice(index, 0, element);

        return this;
    }
    Remove(index) {
        this.elements.splice(index, 1);

        return this;
    }
    get length() { return this.elements.length };
    
    Append(element) {
        this.elements.push(element);

        return this;
    }

    Clone() {
        let elements = [];
        this.elements.forEach((v, i) => { elements.push(v.Clone()); });
        return new CircuitPart(elements);
    }

    Calculate() {
        this.resistance = 0;
        this.voltage = 0;

        this.elements.forEach((v, i) => {
            let [r, u] = v.Calculate();
            this.resistance += r;
            this.voltage += u;
        })

        if (this.voltage === NaN) {
            this.voltage = 0;
        }

        if (this.resistance === Infinity || this.voltage === 0) {
            this.amperage = 0;
        } else {
            this.amperage = this.voltage / this.resistance;
        }

        return [this.resistance, this.voltage];
    }

    Construct(indexStack=null) {
        if (indexStack === null) {
            indexStack = [];
        }

        const node = document.createElement('div');
        node.classList.add('circuitpart');
        
        node.appendChild(placeholderFactory(indexStack.concat([0]).join('-')));

        this.elements.forEach((v, i) => {
            node.appendChild(v.Construct(indexStack.concat([i])));
            node.appendChild(placeholderFactory(indexStack.concat(i + 1).join('-')));
        });

        return node;
    }

    Visit(current, voltage) {
        this.elements.forEach((v, i) => {
            v.Visit(current, v.resistance == Infinity ? voltage : current * v.resistance);
        });
    }
}

class ParallelGroups {
    constructor(groups=null) {
        if (groups === null) {
            this.groups = [];
        } else {
            this.groups = groups;
        }
        this.resistance = null;
        this.voltage = null;
        this.amperage = null;
    }

    get type() { return 'parallelgroups'; }

    AppendGroup(group=null) {
        if (group === null) {
            this.groups.push(new CircuitPart());
        } else {
            this.groups.push(group);
        }

        return this;
    } 

    Clone() {
        let groups = [];
        this.groups.forEach((v, i) => { groups.push(v.Clone()); });
        return new ParallelGroups(groups);
    }

    Construct(indexStack=null) {
        if (indexStack === null) {
            indexStack = [];
        }
        const node = document.createElement('div');
        node.classList.add('parallelgroups');
        node.style.display = "flex"
        node.style.flexDirection = 'row';

        node.appendChild(parallelGroupAdderFactory(indexStack.join('-')));

        const subnode = document.createElement('div');

        node.appendChild(subnode);

        subnode.classList.add('parallelgroups');
        subnode.style.display = "flex"
        subnode.style.flexDirection = 'column';


        let maxWidth = 0;
        
        this.groups.forEach((v, i) => {
            const part = v.Construct(indexStack.concat([i]));

            let height = getHiddenOffsetHeight(part);

            let position = i == 0 ? 'top' : (i == this.groups.length - 1) ? 'bottom' : null;

            if (i == 0) {
                height -= WireTopMargin;
                if (i == this.groups.length - 1) {
                    height = WireWidth;
                }
            } else if (i == this.groups.length - 1) {
                height = WireTopMargin + WireWidth;
            } 
            
            if (i != this.groups.length - 1) {
                height += ParallelInterval + 2 * ElementBorderWidth;
            }

            part.firstChild.before(parallelGroupManagerFactory(indexStack.concat([i]).join('-')));
            part.firstChild.before(parallelGroupsKnotFactory(position, height));
            part.lastChild.after(parallelGroupsKnotFactory(position, height));
            
            subnode.appendChild(part);

            maxWidth = Math.max(maxWidth, getHiddenOffsetWidth(part));
        });

        for (const child of subnode.children) {
            let w = maxWidth - getHiddenOffsetWidth(child);
            if (w == 0) {
                continue;
            }
            child.lastChild.before(fillerFactory(w));
        }

        return node;
    }

    Calculate() {
        let reverseResistance = 0;
        let current = 0
        

        this.groups.forEach((v, i) => {
            let [r, u] = v.Calculate();
            reverseResistance += 1 / r;
            current += u / r;
        })

        if (reverseResistance == Infinity) {
           this.resistance = 0;
           this.voltage = 0;
           this.current = 0;
        } else {
            this.resistance = 1 / reverseResistance;
            if (reverseResistance == 0) {
                this.voltage = 0;
            } else {
                this.voltage = current / reverseResistance;
            }
            this.amperage = current;
        }

        return [this.resistance, this.voltage];
    }

    Visit(current, voltage) {
        this.groups.forEach((v, i) => {
            v.Visit(v.resistance == Infinity ? 0 : voltage / v.resistance, voltage);
        })
    }
}

getComputedSize = function(node) {
    var hiddenElement = node.cloneNode(true);
    hiddenElement.style.display = "flex";

    hiddenElement.style.flexDirection = "row";

    document.querySelector('#circuit').appendChild(hiddenElement);

    var width = Math.ceil(hiddenElement.getBoundingClientRect()['width']);
    var height = Math.ceil(hiddenElement.getBoundingClientRect()['height']);

    hiddenElement.remove();

    return [width, height];
};

getHiddenOffsetWidth = function(node) {
    return getComputedSize(node)[0];
};

getHiddenOffsetHeight = function(node) {
    return getComputedSize(node)[1];
};

function getSize(size = '1em', parent = document.body) {
    let l = document.createElement('div');
    l.style.visibility = 'hidden';
    l.style.boxSize = 'content-box';
    l.style.position = 'absolute';
    l.style.maxHeight = 'none';
    l.style.height = size;
    parent.appendChild(l);
    size = l.getBoundingClientRect()['height'];
    l.remove();
    return size;
}

function updateCurrentPosition(event) { 
    event.preventDefault();   
    var elements = document.getElementsByClassName("selected-placeholder");

    for (var i = 0; i < elements.length; i++) {
        elements[i].classList.remove('selected-placeholder');
    }

    event.target.classList.add('selected-placeholder');

    console.log(event.target);

    currentPosition = event.target.getAttribute('indexincircuit');
}

function addResistor(event) { 
    event.preventDefault();

    var resistance = document.getElementById('resistorResistance').value;

    if (resistance < 0) {
        window.alert('Сопротивление резистора не может быть меньше нуля!');
        return;
    }

    let [scope, index] = getCircuitElementsArray();

    scope.splice(index, 0, new Resistor(parseInt(resistance)));

    let indexes = currentPosition.split('-');
    indexes[indexes.length - 1] = index + 1;
    currentPosition = indexes.join('-');

    updateCircuit();
}

function getCircuitElementsArray(position=null) {
    let scope = circuit.elements;

    if (position == null) {
        position = currentPosition;
    }

    if (position == null) {
        window.alert('Выберите положение на схеме, куда вы хотите вставить элемент');
        return;
    }

    let indexes = position.split('-');

    for (let i = 0; i < indexes.length - 1; i++) {
        let ind = parseInt(indexes[i]);

        if (ind < 0 || scope.length <= ind) {
            window.alert('Недопустимое положение');
            return;
            
        }
 
        let el = scope[ind];

        if (el.type == "parallelgroups") {
            scope = el.groups;
        } else if (el.type == "circuitpart") {
            scope = el.elements;
        } else {
            window.alert('Недопустимое положение');
            return;
        }
    }

    let index = parseInt(indexes[indexes.length - 1]);

    return [scope, index];
}

function addBattery(event) { 
    event.preventDefault();

    var resistance = parseInt(document.getElementById('batteryResistance').value);

    if (resistance < 0) {
        window.alert('Сопротивление резистора не может быть меньше нуля!');
        return;
    }

    var emf = parseInt(document.getElementById('batteryEMF').value);

    let [scope, index] = getCircuitElementsArray();

    scope.splice(index, 0, new Battery(emf, resistance));

    let indexes = currentPosition.split('-');
    indexes[indexes.length - 1] = index + 1;
    currentPosition = indexes.join('-');

    updateCircuit();
}

function addAmmeter(event) { 
    event.preventDefault();

    let [scope, index] = getCircuitElementsArray();

    scope.splice(index, 0, new Ammeter());

    let indexes = currentPosition.split('-');
    indexes[indexes.length - 1] = index + 1;
    currentPosition = indexes.join('-');

    updateCircuit();
}

function addVoltmeter(event) { 
    event.preventDefault();

    let [scope, index] = getCircuitElementsArray();

    scope.splice(index, 0, new Voltmeter());

    let indexes = currentPosition.split('-');
    indexes[indexes.length - 1] = index + 1;
    currentPosition = indexes.join('-');

    updateCircuit();
}

function addParallelGroups() {
    event.preventDefault();

    let [scope, index] = getCircuitElementsArray();

    let el = new ParallelGroups();
    el.AppendGroup().AppendGroup();

    scope.splice(index, 0, el);

    let indexes = currentPosition.split('-');
    indexes[indexes.length - 1] = index + 1;
    currentPosition = indexes.join('-');

    updateCircuit();

}


function updateCircuit() {
    let [r, u] = circuit.Calculate();
    document.getElementById('resistorDisplay').innerHTML = 
        "Итоговое сопротивление цепи: " + to_scientific_notation(r) + ' Ом<br/>' + 
        "Итоговое напряжение цепи: " + to_scientific_notation(u) + ' В<br/>' + 
        "Итоговая сила тока цепи: " + to_scientific_notation(r == Infinity ? 0 : u / r) + ' А';
    circuit.Visit(circuit.amperage, circuit.voltage);

    document.getElementById('circuit').innerHTML = '';
    document.getElementById('circuit').appendChild(circuit.Construct());

    var elements = document.getElementsByClassName("placeholder");

    for (var i = 0; i < elements.length; i++) {
        elements[i].addEventListener('click', updateCurrentPosition);
        elements[i].addEventListener('mouseover', (e) => {     
            var elements = document.getElementsByClassName("hover-placeholder");

            for (var i = 0; i < elements.length; i++) {
                elements[i].classList.remove('hover-placeholder');
            }

            e.target.classList.add('hover-placeholder');
        });
        elements[i].addEventListener('mouseleave', (e) => {     
            e.target.classList.remove('hover-placeholder');
        });
    }
}

function removeElectricElement(position) {
    let circuitPart = circuit;
    let scope = circuit.elements;

    if (position == null) {
        window.alert('Выберите положение на схеме, куда вы хотите вставить элемент');
        return;
    }

    let indexes = position.split('-');

    for (let i = 0; i < indexes.length - 1; i++) {
        let ind = parseInt(indexes[i]);

        if (ind < 0 || scope.length <= ind) {
            window.alert('Недопустимое положение');
            return;
            
        }
 
        let el = scope[ind];

        if (el.type == "parallelgroups") {
            circuitPart = el;
            scope = el.groups;
        } else if (el.type == "circuitpart") {
            circuitPart = el;
            scope = el.elements;
        } else {
            window.alert('Недопустимое положение');
            return;
        }
    }

    let index = parseInt(indexes[indexes.length - 1]);
    
    scope.splice(index, 1);

    if (circuitPart.type == "parallelgroups" && scope.length == 0) {
        let t = position.split('-');
        t.splice(t.length - 1, 1);
        removeElectricElement(t.join('-'));
    }
}

var circuit = new CircuitPart();

window.onload = () => {
    ElementBorderWidth = getSize(window.getComputedStyle(document.body).getPropertyValue('--element-border-width'));
    ParallelInterval = getSize(window.getComputedStyle(document.body).getPropertyValue('--parallel-interval'));
    WireTopMargin = getSize(window.getComputedStyle(document.body).getPropertyValue('--wire-top-margin'));
    WireWidth = getSize(window.getComputedStyle(document.body).getPropertyValue('--wire-height'));

    document.getElementById('resistorSubmitButton').addEventListener('click', addResistor);
    document.getElementById('batterySubmitButton').addEventListener('click', addBattery);
    document.getElementById('ammeterSubmitButton').addEventListener('click', addAmmeter);
    document.getElementById('voltmeterSubmitButton').addEventListener('click', addVoltmeter);
    document.getElementById('parallelGroupsSubmitButton').addEventListener('click', addParallelGroups);
    document.getElementById('clearCircuitSubmitButton').addEventListener('click', () => { 
        circuit = new CircuitPart(); updateCircuit(); 
        currentPosition = null;
    });


    let c = new CircuitPart();
    c.Append(new Battery(10, 0));

    c.Append(new Ammeter());

    let p1 = new ParallelGroups();
    p1.AppendGroup().AppendGroup();

    c.Append(p1);

    p1.groups[0].Append(new Ammeter());
    p1.groups[0].Append(new Resistor(8));
    p1.groups[1].Append(new Ammeter());
    p1.groups[1].Append(new Resistor(10));
    p1.groups[1].Append(new Battery(45, 15));
    
    circuit = c;

    updateCircuit();

}



