import { colors } from '../Chart/VectorField/config'
import * as d3 from 'd3'

class Sprite {
    context: CanvasRenderingContext2D
    created: number
    weight: number
    render: (pos: {
        x: number; y: number
    }) => void
    move: (t: number) => { x: number; y: number }

    constructor(context: CanvasRenderingContext2D, weight: number) {
        this.context = context
        this.weight = weight
        this.created = performance.now()
        this.move = this.generateLissajousMovement(50, 50, 1.15, 2.5)
        this.render = this.generateRenderer()

        console.log('CREATED: ', this);
        
    }
    generateMovement(): any {
        throw new Error("Method not implemented.")
    }

    generateRenderer() {
        return (pos: { x: number; y: number }) => {
            this.context.beginPath();
            this.context.arc(pos.x / 5, pos.y / 5, 2, 0, 2 * Math.PI)
            this.context.closePath();
            this.context.fillStyle = '#000'
            this.context.fill()
            this.context.restore();
        }
    }

    generateLissajousMovement(dx: number, dy: number, tx: number, ty: number) {
        return (t: number) => ({
            x: window.innerWidth / 2 + dx * Math.sin(tx * t),
            y: window.innerHeight / 2 + dy * Math.cos(ty * t)
        })
    }
}

export default Sprite