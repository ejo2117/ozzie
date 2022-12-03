import { useCallback, useEffect, useRef, useState } from "react"
import * as d3 from 'd3'
import Sprite from "./Sprite"


const Field = () => {
    // Hooks
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [context, setContext] = useState<CanvasRenderingContext2D>()
    const [sprites, setSprites] = useState<Sprite[]>()
    
    // Set Context on Mount
    useEffect(() => {
        if(canvasRef.current) setContext(canvasRef.current.getContext("2d")!)
    }, [canvasRef.current])

    // Create Sprites 
    useEffect(() => {
        if (context) {
            const results = []
            for (let i = 0; i < 1; i++) {
                results.push(new Sprite(context, 4))
            }
            setSprites(results)
        }
    }, [context])

    // Logic

    const update = useCallback(()=>{
        if(!context || !sprites) return
        
        let now, sprite;
  
        context.fillStyle = "#f9f9f9";
        context.fillRect(0, 0, 300, 150);
        // context.save()

        // put aside so all sprites are drawn for the same ms
        now = performance.now(); 
        
        for (sprite of sprites)
        {
            sprite.render(sprite.move((now - sprite.created) / 1000));
        }

        window.requestAnimationFrame(() => update());
    },[context, sprites])

    try {
        window.requestAnimationFrame(() => update())
    } catch (error) {
        // assume window is not available
    }

    return <canvas ref={canvasRef}></canvas>
}

export default Field