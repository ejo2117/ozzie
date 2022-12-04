import { useCallback, useEffect, useRef, useState } from "react"
import * as d3 from 'd3'
import Sprite from "./Sprite"
import { Position } from "@lib/types"


const Field = () => {
    // Hooks
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [csvData, setCsvData] = useState()
    const [context, setContext] = useState<CanvasRenderingContext2D>()
    const [sprites, setSprites] = useState<Sprite[]>()
    
    // Set Context on Mount
    useEffect(() => {
        if(canvasRef.current) { 
            canvasRef.current.height = window.innerHeight
            canvasRef.current.width = window.innerWidth
            setContext(canvasRef.current.getContext("2d")!) 
        }
    }, [canvasRef.current])

    // Create Sprites 
    useEffect(() => {
        if (context) {
            const results = []
            const createdAt = performance.now()
            for (let i = 0; i < 1; i++) {
                results.push(new Sprite({context, weight: 4, bpm: 120, created: createdAt}))
            }
            setSprites(results)
        }
    }, [context])

    // Logic
    const update = useCallback(()=>{
        if(!context || !sprites) return
        
        let now: number, sprite: Sprite;
  
        context.fillStyle = "#f9f9f9";
        // Wipes Canvas on each update
        context.fillRect(0, 0, window.innerWidth, window.innerHeight);
        // context.save()

        // put aside so all sprites are drawn for the same ms
        now = performance.now(); 
        
        for (sprite of sprites)
        {
            const head = sprite.render(sprite.move((now - sprite.created) / 1000));
            
            // Debug movement head 
            console.log([Math.floor(head[0]), Math.floor(head[1])])
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