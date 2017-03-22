import { Task, TaskStatus } from './task';

export interface ITaskProvider {
    nextEnabled(): boolean;
    previousEnabled(): boolean;

    currentProcessCompletePercent(): [number, number, number];

    /**
     * If you are handling the stepping completely, return true, otherwise return false;
     */
    stepNext(): boolean;

    /**
     * If you are handling the stepping completely, return true, otherwise return false;
     */
    stepPrevious(): boolean;
}