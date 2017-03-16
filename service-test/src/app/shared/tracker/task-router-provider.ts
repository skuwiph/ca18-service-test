import { Task } from './task';

export interface ITaskRouterProvider {
    navigateToTaskUrl( task: Task): void;
}