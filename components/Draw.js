import styles from '../styles/components/Draw.module.css';

import { useEffect, useRef, useState } from 'react';
import { panelPixels } from '../util/dimensions';

let canvas, ctx;

const panelTiles = 4;
const tilePixels = panelPixels / panelTiles;
const miniTilePixels = tilePixels / panelTiles;
const tileCount = panelTiles * panelTiles;

const gridPixels = 2; // grid pixels

export default function Draw() {
  const canvasRef = useRef();

  const [currTile, setCurrTile] = useState(-1);
  const [tiles, setTiles] = useState(
    Array(tileCount).fill(
      Array(tileCount).fill(false)
    )
  );

  // clamps given num between min and max
  function clamp(num, min, max) {
    return num <= min ? min : num >= max ? max : num;
  }

  // draws given text
  function drawText(text, x, y, alt) {
    ctx.font = '16px monospace';
    ctx.textAlign = 'right';
    ctx.fillStyle = alt ? '#fff' : '#000';
    ctx.fillText(text, x, y);
  }

  function draw() {
    // if no tile selected
    if (currTile === -1) {
      // for each tile
      for (let tx = 0; tx < panelTiles; tx++) {
        for (let ty = 0; ty < panelTiles; ty++) {
          // get tile position
          const spriteIndex = ty * panelTiles + tx;
          const tile = tiles[spriteIndex];
          const tileX = tx * tilePixels;
          const tileY = ty * tilePixels;
          // for each square
          for (let x = 0; x < panelTiles; x++) {
            for (let y = 0; y < panelTiles; y++) {
              // draw tile square
              const tileIndex = y * panelTiles + x;
              ctx.fillStyle = tile[tileIndex] ? '#000' : '#fff';
              const miniX = tileX + x * miniTilePixels;
              const miniY = tileY + y * miniTilePixels;
              ctx.fillRect(miniX, miniY, miniTilePixels, miniTilePixels);
            }
          }
          // draw tile index
          drawText(
            tx + ty * panelTiles + 1,
            tileX + tilePixels - 2,
            tileY + 16,
            tile[panelTiles - 1]
          );
        }
      }
    // if tile selected
    } else {
      // for each square
      for (let x = 0; x < panelTiles; x++) {
        for (let y = 0; y < panelTiles; y++) {
          // draw tile square
          const tileIndex = y * panelTiles + x;
          ctx.fillStyle = tiles[currTile][tileIndex] ? '#000' : '#fff';
          ctx.fillRect(
            x * tilePixels, y * tilePixels,
            tilePixels, tilePixels
          );
        }
      }
      // draw tile index
      drawText(
        currTile + 1,
        panelTiles * tilePixels - 2,
        16,
        tiles[currTile][panelTiles - 1]
      );
    }
    // draw grid lines
    ctx.fillStyle = '#ddd';
    for (let x = 1; x < panelTiles; x++) {
      ctx.fillRect(
        x * tilePixels - gridPixels / 2, 0,
        gridPixels, panelPixels
      );
    }
    for (let y = 1; y < panelTiles; y++) {
      ctx.fillRect(
        0, y * tilePixels - gridPixels / 2,
        panelPixels, gridPixels
      );
    }
  }

  function mouseDown(e) {
    // get mouse x and y
    let mouseX = e.clientX - canvas.offsetLeft + window.scrollX;
    let mouseY = e.clientY - canvas.offsetTop + window.scrollY;
    // clamp mouse x and y
    mouseX = clamp(mouseX, 0, panelPixels - 1);
    mouseY = clamp(mouseY, 0, panelPixels - 1);
    // get tile x and y
    const tileX = Math.floor(mouseX / tilePixels);
    const tileY = Math.floor(mouseY / tilePixels);
    const tileIndex = tileY * panelTiles + tileX;
    // select tile
    if (currTile === -1) {
      setCurrTile(tileIndex);
    } else {
      // draw tile
      const newTiles = tiles.slice();
      const newTile = newTiles[currTile].slice();
      newTile[tileIndex] = !newTile[tileIndex];
      newTiles[currTile] = newTile;
      setTiles(newTiles);
    }
  }

  useEffect(() => {
    canvas = canvasRef.current;
    ctx = canvas.getContext('2d');
    draw();
  }, []);

  useEffect(() => {
    draw();
  }, [currTile, tiles]);

  return (
    <div
      className={styles.container}
      style={{ width: panelPixels, height: panelPixels }}
    >
      {
        currTile !== -1 &&
        <button
          className={styles.back}
          onClick={() => setCurrTile(-1)}
          style={{ color: tiles[currTile][0] ? '#fff' : '#000' }}
        >
          ⬅
        </button>
      }
      <canvas
        ref={canvasRef}
        onMouseDown={mouseDown}
        width={panelPixels}
        height={panelPixels}
      />
    </div>
  );
}
