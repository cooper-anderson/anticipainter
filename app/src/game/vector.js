export class Vector {
	constructor(x=0, y=0) {
		this.x = x;
		this.y = y;
	}

	static zero() {
		return new Vector(0, 0)
	}

	getRounded() {
		return new Vector(Math.round(this.x), Math.round(this.y))
	}

	static equals(a, b) {
		return a.x == b.x && a.y == b.y
	}

	static add(a, b) {
		return new Vector(a.x + b.x, a.y + b.y);
	}

	static sub(a, b) {
		return new Vector(a.x - b.x, a.y - b.y);
	}

	static mul(a, b) {
		return new Vector(a.x * b, a.y * b);
	}

	static div(a, b) {
		return (b === 0) ? new Vector(a.x / b, a.y / b) : new Vector();
	}

	static neg(a) {
		return new Vector(-a.x, -a.y)
	}

	static lerp(a, b, t) {
		return Vector.add(a, Vector.mul(Vector.sub(b, a), t))
	}

	static rotate(vector, degrees=90) {
		let rotated = new Vector();
		rotated.x = Math.round(vector.x * Math.cos(degrees * 0.0174533) - vector.y * Math.sin(degrees * 0.0174533));
		rotated.y = Math.round(vector.x * Math.sin(degrees * 0.0174533) + vector.y * Math.cos(degrees * 0.0174533));
		return rotated;
	}

	static fromList(list) {
		return new Vector(list[0], list[1]);
	}

	static toList(vector) {
		return [vector.x, vector.y];
	}

	static toString(vector) {
		return `${vector.x}-${vector.y}`;
	}
}