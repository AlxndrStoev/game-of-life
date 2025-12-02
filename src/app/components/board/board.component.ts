import {
  Component,
  Input,
  OnChanges,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import { interval, Subscription } from 'rxjs';
import { NotificationService } from 'src/app/services/notification.service';

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BoardComponent implements OnChanges {
  @Input() gridSize!: number;
  @Output() public evolving = new EventEmitter<boolean>();
  @Output() public hasLiveCells = new EventEmitter<boolean>();

  public grid!: number[][];
  private nextGeneration!: number[][];
  private subscription: Subscription | undefined;
  private previousGeneration: number[][] | undefined;

  constructor(
    private readonly notificationService: NotificationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnChanges(): void {
    this.gridSize = this.gridSize;
    this.grid = new Array(this.gridSize);
    this.nextGeneration = new Array(this.gridSize);

    for (let i = 0; i < this.grid.length; i++) {
      this.grid[i] = new Array(this.gridSize);
      this.nextGeneration[i] = new Array(this.gridSize);
    }

    this.reset();
  }

  public trackBy(index: number): number {
    return index;
  }

  public trackByCell(rowIndex: number, colIndex: number): string {
    return `${rowIndex}-${colIndex}`;
  }

  private emitLiveCells(): void {
    const hasAny = this.grid.some(row => row.some(cell => cell === 1));
    this.hasLiveCells.emit(hasAny);
  }

  public reset(): void {
    this.resetGrid();
    this.evolving.emit(false);
    this.subscription?.unsubscribe();
    this.emitLiveCells();
  }

  private resetGrid(): void {
    for (let row = 0; row < this.grid.length; row++) {
      for (let col = 0; col < this.grid[row].length; col++) {
        this.grid[row][col] = 0;
        this.nextGeneration[row][col] = 0;
      }
    }
  }

  public randomize(): void {
    // Adjust density based on grid size for better performance
    const densityFactor = Math.max(0.12, 0.6 * Math.exp(-this.gridSize / 50));

    for (let row = 0; row < this.grid.length; row++) {
      for (let col = 0; col < this.grid[row].length; col++) {
        this.grid[row][col] = Math.random() < densityFactor ? 1 : 0;
      }
    }

    this.cdr.markForCheck();
    this.emitLiveCells();
  }

  public next(): void {
    this.evolve();
    this.evolving.emit(false);
  }

  public auto(): void {
    this.subscription = interval(125).subscribe(() => this.evolve());
  }

  public pause(): void {
    this.subscription?.unsubscribe();
    this.evolving.emit(false);
  }

  public evolve(): void {
    this.evolving.emit(true);

    for (let row = 0; row < this.grid.length; row++) {
      for (let col = 0; col < this.grid[row].length; col++) {
        const cell = this.grid[row][col];
        const neighbours: number[] = [];
        let aliveNeighbours: number | null = null;

        // Collect neighbours:
        if (
          row === 0 ||
          col === 0 ||
          row === this.grid.length - 1 ||
          col === this.grid.length - 1
        ) {
          // Means we're in the one of four side walls of the matrix.
          if (row === 0 && col === 0) {
            // Top left corner, the neighbours are the ones on the right, on the bottom right diagonal and on the bottom.
            neighbours.push(
              this.grid[row][col + 1],
              this.grid[row + 1][col],
              this.grid[row + 1][col + 1]
            );
          } else if (row === 0 && col === this.grid.length - 1) {
            // Top right corner, the neighbours are the ones on the left, on the bottom left diagonal and on the bottom.
            neighbours.push(
              this.grid[row][col - 1],
              this.grid[row + 1][col - 1],
              this.grid[row + 1][col]
            );
          } else if (row === this.grid.length - 1 && col === 0) {
            // Bottom left corner, the neighbours are the ones on the top, on the top right diagonal and on the right.
            neighbours.push(
              this.grid[row - 1][col],
              this.grid[row - 1][col + 1],
              this.grid[row][col + 1]
            );
          } else if (
            row === this.grid.length - 1 &&
            col === this.grid.length - 1
          ) {
            // Bottom right corner, the neighbours are the ones on the left, on the top left diagonal and on the top.
            neighbours.push(
              this.grid[row][col - 1],
              this.grid[row - 1][col - 1],
              this.grid[row - 1][col]
            );
          } else if (col === 0 && row < this.grid.length - 1) {
            // Left wall, the neighbours are the ones on the top, on the top right diagonal, on the right, on the bottom right diagonal and on the bottom.
            neighbours.push(
              this.grid[row - 1][col],
              this.grid[row - 1][col + 1],
              this.grid[row][col + 1],
              this.grid[row + 1][col + 1],
              this.grid[row + 1][col]
            );
          } else if (row === 0 && col < this.grid.length - 1) {
            // Top wall, the neighbours are the ones on the left, on the bottom left diagonal, on the bottom, on the bottom right diagonal and on the right.
            neighbours.push(
              this.grid[row][col - 1],
              this.grid[row + 1][col - 1],
              this.grid[row + 1][col],
              this.grid[row + 1][col + 1],
              this.grid[row][col + 1]
            );
          } else if (
            col === this.grid.length - 1 &&
            row < this.grid.length - 1
          ) {
            // Right wall, the neighbours are the ones on the top, on the top left diagonal, on the left, on the bottom left diagonal and on the bottom.
            neighbours.push(
              this.grid[row - 1][col],
              this.grid[row - 1][col - 1],
              this.grid[row][col - 1],
              this.grid[row + 1][col - 1],
              this.grid[row + 1][col]
            );
          } else if (
            row === this.grid.length - 1 &&
            col < this.grid.length - 1
          ) {
            // Bottom wall, the neighbours are the ones on the left, on the top left diagonal, on the top, on the top right diagonal and on the right.
            neighbours.push(
              this.grid[row][col - 1],
              this.grid[row - 1][col - 1],
              this.grid[row - 1][col],
              this.grid[row - 1][col + 1],
              this.grid[row][col + 1]
            );
          }
        } else {
          // Means we have eight neighbours from all sides.
          // The available neighbours are the ones on the left, on the top left diagonal, on the top, on the top right diagonal, on the right, on the bottom right diagonal, on the bottom and on the bottom left diagonal.
          neighbours.push(
            this.grid[row][col - 1],
            this.grid[row - 1][col - 1],
            this.grid[row - 1][col],
            this.grid[row - 1][col + 1],
            this.grid[row][col + 1],
            this.grid[row + 1][col + 1],
            this.grid[row + 1][col],
            this.grid[row + 1][col - 1]
          );
        }

        // Count alive neighbours
        aliveNeighbours = neighbours.filter(Boolean).length;

        // Validate evolution conditions and evolve.
        // Either way we should not overwrite the current cell within the current generation as the next evolution won't be correct.

        // If alive:
        if (cell) {
          // Any live cell with two or three live neighbours survives.
          // All other live cells die in the next generation. Similarly, all other dead cells stay dead.
          this.nextGeneration[row][col] =
            aliveNeighbours === 2 || aliveNeighbours === 3 ? 1 : 0;
        }
        // If dead:
        else {
          // Any dead cell with three live neighbours becomes a live cell.
          this.nextGeneration[row][col] = aliveNeighbours === 3 ? 1 : 0;
        }
      }
    }

    // Efficient array copy using map
    this.grid = this.nextGeneration.map((row) => [...row]);

    if (this.previousGeneration && this.endEvolution()) {
      this.notificationService.info('The evolution came to an end.');
      this.subscription?.unsubscribe();
      this.evolving.emit(false);
    }

    // Efficient array copy using map
    this.previousGeneration = this.nextGeneration.map((row) => [...row]);
    this.cdr.markForCheck();
    this.emitLiveCells();
  }

  public onClick(e: Event): void {
    const cell = e.target as HTMLElement;
    const row: number = Number(cell.getAttribute('data-row'));
    const col: number = Number(cell.getAttribute('data-col'));

    this.grid[col][row] = this.grid[col][row] === 0 ? 1 : 0;
    this.cdr.markForCheck();
    this.emitLiveCells();

    // console.table(this.grid);
  }

  private endEvolution(): boolean {
    if (!this.previousGeneration) return false;

    for (let row = 0; row < this.grid.length; row++) {
      for (let col = 0; col < this.grid[row].length; col++) {
        if (
          this.previousGeneration[row][col] !== this.nextGeneration[row][col]
        ) {
          return false;
        }
      }
    }
    return true;
  }
}
