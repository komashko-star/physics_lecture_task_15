var ElementBorderWidth;
var ParallelInterval;
var WireTopMargin;
var WireWidth;


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

    Construct() {
        const node = document.createElement('div');
        node.classList.add('resistor');
        node.classList.add('electric-element');
        node.innerHTML = "<span>🎚 " + this.resistance + " Ом" + "</span>";

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

    Construct() {
        const node = document.createElement('div');
        node.classList.add('battery');
        node.classList.add('electric-element');
        node.innerHTML = "<span>🔋 " + this.emf + " В; " + this.resistance + " Ом; " + "</span>";

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

    Calculate() {
        return [this.resistance, this.voltage];
    }

    Construct() {
        const node = document.createElement('div');
        node.classList.add('ammeter');
        node.classList.add('electric-element');
        node.innerHTML = "<span>⏲️ " + (this.current === null ? "?" : to_scientific_notation(this.current)) + " А</span>";
        this.node = node;

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

    Calculate() {
        return [this.resistance, 0];
    }

    Construct() {
        const node = document.createElement('div');
        node.classList.add('ammeter');
        node.classList.add('electric-element');
        node.innerHTML = "<span>⏲️ " + (this.voltage === null ? "?" : to_scientific_notation(this.voltage)) + " В</span>";
        this.node = node;

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
    node.setAttribute('indexInCircuit', index);

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

        if (this.resistance === Infinity || this.voltage === 0) {
            this.amperage = 0;
        } else {
            this.amperage = this.voltage / this.resistance;
        }

        return [this.resistance, this.voltage];
    }

    Construct() {
        const node = document.createElement('div');
        node.classList.add('circuitpart');
        
        node.appendChild(placeholderFactory(0));

        this.elements.forEach((v, i) => {
            node.appendChild(v.Construct());
            node.appendChild(placeholderFactory(i + 1));
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

    Construct() {
        const node = document.createElement('div');
        node.classList.add('parallelgroups');
        node.style.display = "flex"
        node.style.flexDirection = 'column';

        let maxWidth = 0;
        
        this.groups.forEach((v, i) => {
            const part = v.Construct();

            let height = getHiddenOffsetHeight(part);

            let position = i == 0 ? 'top' : (i == this.groups.length - 1) ? 'bottom' : null;

            if (i == 0) {
                height -= WireTopMargin;
            }

            if (i == this.groups.length - 1) {
                height = WireTopMargin + WireWidth;
            } else {
                height += ParallelInterval + 2 * ElementBorderWidth;
            }

            part.firstChild.before(parallelGroupsKnotFactory(position, height));
            part.lastChild.after(parallelGroupsKnotFactory(position, height));
            
            node.appendChild(part);

            maxWidth = Math.max(maxWidth, getHiddenOffsetWidth(part));
        });

        for (const child of node.children) {
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
            this.voltage = current / reverseResistance;
            this.amperage = current;
        }

        return [this.resistance, this.voltage];
    }

    Visit(current, voltage) {
        this.groups.forEach((v, i) => {
            v.Visit(voltage / v.resistance, voltage);
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

window.onload = () => {
    ElementBorderWidth = getSize(window.getComputedStyle(document.body).getPropertyValue('--element-border-width'));
    ParallelInterval = getSize(window.getComputedStyle(document.body).getPropertyValue('--parallel-interval'));
    WireTopMargin = getSize(window.getComputedStyle(document.body).getPropertyValue('--wire-top-margin'));
    WireWidth = getSize(window.getComputedStyle(document.body).getPropertyValue('--wire-height'));


    let c = new CircuitPart();
    c.Append(new Battery(10, 0));

    let p = new ParallelGroups();
    p.AppendGroup().AppendGroup().AppendGroup();

    p.groups[0].Append(new Ammeter());
    p.groups[0].Append(new Resistor(10));
    p.groups[0].Append(new Battery(12, 5));
    p.groups[1].Append(new Ammeter());
    p.groups[1].Append(new Resistor(20));
    p.groups[2].Append(new Ammeter());
    p.groups[2].Append(new Resistor(30));
    p.groups[2].Append(new Battery(11, 3));


    c.Append(p);

    c.Append(new Resistor(23));

    c.Append(new Battery(23, 2));
    c.Append(new Ammeter());

    let p1 = new ParallelGroups();
    p1.AppendGroup().AppendGroup();

    c.Append(p1);
    c.Append(new Ammeter());

    p1.groups[0].Append(new Ammeter());
    p1.groups[0].Append(new Resistor(6));
    p1.groups[1].Append(new Ammeter());
    p1.groups[1].Append(new Resistor(9));
    p1.groups[1].Append(new Battery(42, 7));

    
    c.Append(new Ammeter());

    let [r, u] = c.Calculate();
    document.getElementById('resistorDisplay').innerText = r + ', ' + u;
    c.Visit(c.amperage, c.voltage);

    document.getElementById('circuit').appendChild(c.Construct());
}



