import { Task, TaskStatus } from './task';

export interface ITaskRouterProvider {
    navigateToTaskUrl( task: Task, currentDirection: number, lastStatus: TaskStatus ): boolean;
}