import Rect from '../rect'

const dw = 1680
const dh = 930

const rA = new Rect(0, 0, dw, dh)
const rB = new Rect(0, 100, dw, dh)
const rC = new Rect(50, 20, 100, 70)
const rD = new Rect(0, 1000, dw, dh)
const rE = new Rect(0, 900, dw, dh)

const rX = new Rect(173, 0, dw, dh)
const rY = new Rect(1700, 0, dw, dh)

const rAB = new Rect(0, 0, dw, 1030)
const rAE = new Rect(0, 0, dw, 1830)
const rAED = new Rect(0, 0, dw, 1930)

const rAX = new Rect(0, 0, dw + 173, dh)
const rAXY = new Rect(0, 0, dw + 1700, dh)

const rCt = new Rect(20, 50, 70, 100)

// FIXME: add horizontal merge tests

test('rA right', () => {
    expect(rA.right).toBe(dw)
})

test('rC bottom', () => {
    expect(rC.bottom).toBe(90)
})

test('rB should not be contained in rA', () => {
    expect(rA.contains(rB)).toBe(false)
})

test('merge of rA and rB equal to rAB', () => {
    expect(rA.merge(rB)).toStrictEqual(rAB)
})

test('cannot merge rA and rD', () => {
    expect(rA.merge(rD)).toBeNull()
})

test('can merge rA with rE and then with rD', () => {
    const m = rA.merge(rE)
    expect(m).toStrictEqual(rAE)
    expect(m.merge(rD)).toStrictEqual(rAED)
})

test('transposed rC', () => {
    expect(rC.transposed()).toStrictEqual(rCt)
})

test('double transposed rC should be rC', () => {
    expect(rC.transposed().transposed()).toStrictEqual(rC)
})

test('can merge rA with rX', () => {
    expect(rA.merge(rX)).toStrictEqual(rAX)
})

test('cannot merge rA with rY', () => {
    expect(rA.merge(rY)).toBeNull()
})

test('can merge rA with rX and then rY', () => {
    const m = rA.merge(rX)
    expect(m).toStrictEqual(rAX)
    expect(m.merge(rY)).toStrictEqual(rAXY)
})

test('cannot merge horizontally and vertically different', () => {
    expect(rC.merge(rX)).toBeNull()
})
