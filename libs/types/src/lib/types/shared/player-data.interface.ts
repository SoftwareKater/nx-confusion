import { GameTask } from './game-task.interface';

export interface PlayerData {
 id?: string;
 name?: string;
 score?: number;
 task?: GameTask;
}
