export type SortStep = {
  array: number[];
  comparing?: number[];
  swapping?: number[];
  sorted?: number[];
};

export function* bubbleSort(arr: number[]): Generator<SortStep> {
  const array = [...arr];
  const sorted: number[] = [];
  const n = array.length;

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      yield { array: [...array], comparing: [j, j + 1], sorted: [...sorted] };
      if (array[j] > array[j + 1]) {
        yield { array: [...array], swapping: [j, j + 1], sorted: [...sorted] };
        [array[j], array[j + 1]] = [array[j + 1], array[j]];
      }
    }
    sorted.push(n - i - 1);
    yield { array: [...array], sorted: [...sorted] };
  }
  yield { array: [...array], sorted: array.map((_, i) => i) };
}

export function* selectionSort(arr: number[]): Generator<SortStep> {
  const array = [...arr];
  const sorted: number[] = [];
  const n = array.length;

  for (let i = 0; i < n; i++) {
    let minIdx = i;
    for (let j = i + 1; j < n; j++) {
      yield { array: [...array], comparing: [minIdx, j], sorted: [...sorted] };
      if (array[j] < array[minIdx]) {
        minIdx = j;
      }
    }
    if (minIdx !== i) {
      yield { array: [...array], swapping: [i, minIdx], sorted: [...sorted] };
      [array[i], array[minIdx]] = [array[minIdx], array[i]];
    }
    sorted.push(i);
    yield { array: [...array], sorted: [...sorted] };
  }
  yield { array: [...array], sorted: array.map((_, i) => i) };
}

export function* insertionSort(arr: number[]): Generator<SortStep> {
  const array = [...arr];
  const sorted: number[] = [0];
  const n = array.length;

  for (let i = 1; i < n; i++) {
    let key = array[i];
    let j = i - 1;

    while (j >= 0 && array[j] > key) {
      yield { array: [...array], comparing: [j, j + 1], sorted: [...sorted] };
      yield { array: [...array], swapping: [j, j + 1], sorted: [...sorted] };
      array[j + 1] = array[j];
      j = j - 1;
    }
    array[j + 1] = key;
    sorted.push(i);
    yield { array: [...array], sorted: [...sorted] };
  }
  yield { array: [...array], sorted: array.map((_, i) => i) };
}

export function* mergeSort(arr: number[]): Generator<SortStep> {
  const array = [...arr];
  const sorted: number[] = [];

  function* merge(l: number, m: number, r: number): Generator<SortStep> {
    const n1 = m - l + 1;
    const n2 = r - m;
    const L = new Array(n1);
    const R = new Array(n2);

    for (let i = 0; i < n1; i++) L[i] = array[l + i];
    for (let j = 0; j < n2; j++) R[j] = array[m + 1 + j];

    let i = 0, j = 0, k = l;
    while (i < n1 && j < n2) {
      yield { array: [...array], comparing: [l + i, m + 1 + j], sorted: [...sorted] };
      if (L[i] <= R[j]) {
        array[k] = L[i];
        i++;
      } else {
        array[k] = R[j];
        j++;
      }
      yield { array: [...array], swapping: [k], sorted: [...sorted] };
      k++;
    }

    while (i < n1) {
      array[k] = L[i];
      yield { array: [...array], swapping: [k], sorted: [...sorted] };
      i++;
      k++;
    }

    while (j < n2) {
      array[k] = R[j];
      yield { array: [...array], swapping: [k], sorted: [...sorted] };
      j++;
      k++;
    }
  }

  function* mergeSortHelper(l: number, r: number): Generator<SortStep> {
    if (l >= r) return;
    const m = l + Math.floor((r - l) / 2);
    yield* mergeSortHelper(l, m);
    yield* mergeSortHelper(m + 1, r);
    yield* merge(l, m, r);
  }

  yield* mergeSortHelper(0, array.length - 1);
  yield { array: [...array], sorted: array.map((_, i) => i) };
}

export function* quickSort(arr: number[]): Generator<SortStep> {
  const array = [...arr];
  const sorted: number[] = [];

  function* partition(low: number, high: number): Generator<SortStep, number> {
    const pivot = array[high];
    let i = low - 1;

    for (let j = low; j <= high - 1; j++) {
      yield { array: [...array], comparing: [j, high], sorted: [...sorted] };
      if (array[j] < pivot) {
        i++;
        yield { array: [...array], swapping: [i, j], sorted: [...sorted] };
        [array[i], array[j]] = [array[j], array[i]];
      }
    }
    yield { array: [...array], swapping: [i + 1, high], sorted: [...sorted] };
    [array[i + 1], array[high]] = [array[high], array[i + 1]];
    return i + 1;
  }

  function* quickSortHelper(low: number, high: number): Generator<SortStep> {
    if (low < high) {
      const pi: number = yield* partition(low, high);
      sorted.push(pi);
      yield { array: [...array], sorted: [...sorted] };
      yield* quickSortHelper(low, pi - 1);
      yield* quickSortHelper(pi + 1, high);
    } else if (low === high) {
      sorted.push(low);
      yield { array: [...array], sorted: [...sorted] };
    }
  }

  yield* quickSortHelper(0, array.length - 1);
  yield { array: [...array], sorted: array.map((_, i) => i) };
}
