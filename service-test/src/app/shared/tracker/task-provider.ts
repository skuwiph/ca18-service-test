import { Task, TaskStatus } from './task';

export interface ITaskProvider {
    nextEnabled(): boolean;
    previousEnabled(): boolean;

    currentProcessCompletePercent(): number;
}