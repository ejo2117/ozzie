import { forwardRef, useState } from "react"

type CanvasProps = JSX.IntrinsicElements['canvas'] & {

}

const Canvas = forwardRef<HTMLCanvasElement, CanvasProps>((props, ref) => {
    const [ctx, setCtx] = useState<CanvasRenderingContext2D>() 
    
    
    return <canvas ref={ref}></canvas>
})

Canvas.displayName = 'Canvas'

export default Canvas