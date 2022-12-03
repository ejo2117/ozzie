import { Position } from "@lib/types";
import { COLORS } from "./utils";

type RenderArgs = [pos: Position, time: number]

class Sprite {
    context: CanvasRenderingContext2D
    created: number
    weight: number
    render: (args: RenderArgs) => Position
    move: (t: number) => RenderArgs

    constructor(context: CanvasRenderingContext2D, weight: number) {
        this.context = context
        this.weight = weight
        this.created = performance.now()
        this.move = this.generateLissajousMovement(150, 150, 5, 2)
        this.render = this.generateRenderer()
    }

    generateRenderer() {
        return ([[ x, y ], t]: RenderArgs) => {
            this.context.beginPath();
            this.context.arc(x, y, 100, 0, 2 * Math.PI)
            this.context.closePath();
            this.context.fillStyle = COLORS.rainbow((x / y), [-1, 2])
            this.context.fill()
            this.context.restore();
            
            // For debugging
            return [x, y] as Position
        }
    }
    
    /**
     * Returns a parametric "orbit" function that specifies a point in 2D space at time `t`
     *
     * `dx` - width of orbit
     * 
     * `dy` - height of orbit
     * 
     * `tx / ty` =  Number of horizontal "peaks" within the orbit
     * @memberof Sprite
     */
    generateLissajousMovement(dx: number, dy: number, tx: number, ty: number) {
        return (t: number) => [[
            window.innerWidth / 2 + dx * Math.sin(tx * t),
            window.innerHeight / 2 + dy * Math.cos(ty * t)
        ], t] as RenderArgs
    }
}

export default Sprite