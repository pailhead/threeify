//
// based on Quaternion from Three.js
//
// Authors:
// * @bhouston
//

import { Euler, EulerOrder } from './Euler.js';
import { IPrimitive } from './IPrimitive.js';
import { Matrix4 } from './Matrix4.js';
import { Vector3 } from './Vector3.js';
import { hashFloat4 } from '../hash.js';

export class Quaternion implements IPrimitive<Quaternion> {
	x: number;
	y: number;
	z: number;
	w: number;

	constructor(x: number = 0, y: number = 0, z: number = 0, w: number = 1) {
		this.x = x;
		this.y = y;
		this.z = z;
		this.w = w;
	}

	getHashCode() {
		return hashFloat4(this.x, this.y, this.z, this.w);
	}

	clone() {
		return new Quaternion().copy(this);
	}

	copy(q: Quaternion) {
		this.x = q.x;
		this.y = q.y;
		this.z = q.x;
		this.w = q.w;

		return this;
	}

	add(q: Quaternion) {
		this.x += q.x;
		this.y += q.y;
		this.z += q.z;
		this.w += q.w;

		return this;
	}

	getComponent(index: number) {
		switch (index) {
			case 0:
				return this.x;
			case 1:
				return this.y;
			case 2:
				return this.z;
			case 3:
				return this.w;
			default:
				throw new Error('index of our range: ' + index);
		}
	}

	setComponent(index: number, value: number) {
		switch (index) {
			case 0:
				this.x = value;
				break;
			case 1:
				this.y = value;
				break;
			case 2:
				this.z = value;
				break;
			case 3:
				this.w = value;
				break;
			default:
				throw new Error('index of our range: ' + index);
		}

		return this;
	}

	numComponents() {
		return 4;
	}

	dot(q: Quaternion) {
		return this.x * q.x + this.y * q.y + this.z * q.z + this.w * q.w;
	}

	conjugate() {
		this.x *= -1;
		this.y *= -1;
		this.z *= -1;

		return this;
	}

	length() {
		return Math.sqrt(
			this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w,
		);
	}

	normalize() {
		let l = this.length();

		if (l === 0) {
			this.x = 0;
			this.y = 0;
			this.z = 0;
			this.w = 1;
		} else {
			l = 1 / l;

			this.x *= l;
			this.y *= l;
			this.z *= l;
			this.w *= l;
		}

		return this;
	}

	setFromEuler(euler: Euler) {
		let x = euler.x,
			y = euler.y,
			z = euler.z,
			order = euler.order;

		// http://www.mathworks.com/matlabcentral/fileexchange/
		// 	20696-function-to-convert-between-dcm-euler-angles-quaternions-and-euler-vectors/
		//	content/SpinCalc.m

		let c1 = Math.cos(x / 2);
		let c2 = Math.cos(y / 2);
		let c3 = Math.cos(z / 2);

		let s1 = Math.sin(x / 2);
		let s2 = Math.sin(y / 2);
		let s3 = Math.sin(z / 2);

		switch (order) {
			case EulerOrder.XYZ:
				this.x = s1 * c2 * c3 + c1 * s2 * s3;
				this.y = c1 * s2 * c3 - s1 * c2 * s3;
				this.z = c1 * c2 * s3 + s1 * s2 * c3;
				this.w = c1 * c2 * c3 - s1 * s2 * s3;
				break;

			case EulerOrder.YXZ:
				this.x = s1 * c2 * c3 + c1 * s2 * s3;
				this.y = c1 * s2 * c3 - s1 * c2 * s3;
				this.z = c1 * c2 * s3 - s1 * s2 * c3;
				this.w = c1 * c2 * c3 + s1 * s2 * s3;
				break;

			case EulerOrder.ZXY:
				this.x = s1 * c2 * c3 - c1 * s2 * s3;
				this.y = c1 * s2 * c3 + s1 * c2 * s3;
				this.z = c1 * c2 * s3 + s1 * s2 * c3;
				this.w = c1 * c2 * c3 - s1 * s2 * s3;
				break;

			case EulerOrder.ZYX:
				this.x = s1 * c2 * c3 - c1 * s2 * s3;
				this.y = c1 * s2 * c3 + s1 * c2 * s3;
				this.z = c1 * c2 * s3 - s1 * s2 * c3;
				this.w = c1 * c2 * c3 + s1 * s2 * s3;
				break;

			case EulerOrder.YZX:
				this.x = s1 * c2 * c3 + c1 * s2 * s3;
				this.y = c1 * s2 * c3 + s1 * c2 * s3;
				this.z = c1 * c2 * s3 - s1 * s2 * c3;
				this.w = c1 * c2 * c3 - s1 * s2 * s3;
				break;

			case EulerOrder.XZY:
				this.x = s1 * c2 * c3 - c1 * s2 * s3;
				this.y = c1 * s2 * c3 - s1 * c2 * s3;
				this.z = c1 * c2 * s3 + s1 * s2 * c3;
				this.w = c1 * c2 * c3 + s1 * s2 * s3;
				break;
		}

		return this;
	}

	setFromRotationMatrix4(m: Matrix4) {
		// http://www.euclideanspace.com/maths/geometry/rotations/conversions/matrixToQuaternion/index.htm

		// assumes the upper 3x3 of m is a pure rotation matrix (i.e, unscaled)

		// TODO, allocate x, y, z, w and only set this.* at the end.

		let te = m.elements,
			m11 = te[0],
			m12 = te[4],
			m13 = te[8],
			m21 = te[1],
			m22 = te[5],
			m23 = te[9],
			m31 = te[2],
			m32 = te[6],
			m33 = te[10],
			trace = m11 + m22 + m33,
			s;

		if (trace > 0) {
			s = 0.5 / Math.sqrt(trace + 1.0);

			this.w = 0.25 / s;
			this.x = (m32 - m23) * s;
			this.y = (m13 - m31) * s;
			this.z = (m21 - m12) * s;
		} else if (m11 > m22 && m11 > m33) {
			s = 2.0 * Math.sqrt(1.0 + m11 - m22 - m33);

			this.w = (m32 - m23) / s;
			this.x = 0.25 * s;
			this.y = (m12 + m21) / s;
			this.z = (m13 + m31) / s;
		} else if (m22 > m33) {
			s = 2.0 * Math.sqrt(1.0 + m22 - m11 - m33);

			this.w = (m13 - m31) / s;
			this.x = (m12 + m21) / s;
			this.y = 0.25 * s;
			this.z = (m23 + m32) / s;
		} else {
			s = 2.0 * Math.sqrt(1.0 + m33 - m11 - m22);

			this.w = (m21 - m12) / s;
			this.x = (m13 + m31) / s;
			this.y = (m23 + m32) / s;
			this.z = 0.25 * s;
		}

		return this;
	}

	setFromAxisAngle(axis: Vector3, angle: number) {
		// http://www.euclideanspace.com/maths/geometry/rotations/conversions/angleToQuaternion/index.htm

		// assumes axis is normalized

		let halfAngle = angle / 2,
			s = Math.sin(halfAngle);

		this.x = axis.x * s;
		this.y = axis.y * s;
		this.z = axis.z * s;
		this.w = Math.cos(halfAngle);

		return this;
	}

	multiplyQuaternion(q: Quaternion) {
		// from http://www.euclideanspace.com/maths/algebra/realNormedAlgebra/quaternions/code/index.htm

		let qax = this.x,
			qay = this.y,
			qaz = this.z,
			qaw = this.w;
		let qbx = q.x,
			qby = q.y,
			qbz = q.z,
			qbw = q.w;

		this.x = qax * qbw + qaw * qbx + qay * qbz - qaz * qby;
		this.y = qay * qbw + qaw * qby + qaz * qbx - qax * qbz;
		this.z = qaz * qbw + qaw * qbz + qax * qby - qay * qbx;
		this.w = qaw * qbw - qax * qbx - qay * qby - qaz * qbz;

		return this;
	}

	slerp(qb: Quaternion, t: number) {
		if (t === 0) return this;
		if (t === 1) return this.copy(qb);

		let x = this.x,
			y = this.y,
			z = this.z,
			w = this.w;

		// http://www.euclideanspace.com/maths/algebra/realNormedAlgebra/quaternions/slerp/
		// TODO, allocate x, y, z, w and only set this.* at the end.

		let cosHalfTheta = w * qb.w + x * qb.x + y * qb.y + z * qb.z;

		if (cosHalfTheta < 0) {
			this.w = -qb.w;
			this.x = -qb.x;
			this.y = -qb.y;
			this.z = -qb.z;

			cosHalfTheta = -cosHalfTheta;
		} else {
			this.copy(qb);
		}

		if (cosHalfTheta >= 1.0) {
			this.w = w;
			this.x = x;
			this.y = y;
			this.z = z;

			return this;
		}

		let sqrSinHalfTheta = 1.0 - cosHalfTheta * cosHalfTheta;

		if (sqrSinHalfTheta <= Number.EPSILON) {
			let s = 1 - t;
			this.w = s * w + t * this.w;
			this.x = s * x + t * this.x;
			this.y = s * y + t * this.y;
			this.z = s * z + t * this.z;

			this.normalize();

			return this;
		}

		let sinHalfTheta = Math.sqrt(sqrSinHalfTheta);
		let halfTheta = Math.atan2(sinHalfTheta, cosHalfTheta);
		let ratioA = Math.sin((1 - t) * halfTheta) / sinHalfTheta,
			ratioB = Math.sin(t * halfTheta) / sinHalfTheta;

		this.w = w * ratioA + this.w * ratioB;
		this.x = x * ratioA + this.x * ratioB;
		this.y = y * ratioA + this.y * ratioB;
		this.z = z * ratioA + this.z * ratioB;

		return this;
	}

	equals(q: Quaternion) {
		return q.x === this.x && q.y === this.y && q.z === this.z && q.w === this.w;
	}

	setFromArray(floatArray: Float32Array, offset: number) {
		this.x = floatArray[offset + 0];
		this.y = floatArray[offset + 1];
		this.z = floatArray[offset + 2];
		this.w = floatArray[offset + 3];
	}

	toArray(floatArray: Float32Array, offset: number) {
		floatArray[offset + 0] = this.x;
		floatArray[offset + 1] = this.y;
		floatArray[offset + 2] = this.z;
		floatArray[offset + 3] = this.w;
	}
}
