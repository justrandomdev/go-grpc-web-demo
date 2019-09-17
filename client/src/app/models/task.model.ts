export class Task {
    id: number;
    description: string;
    isComplete: boolean;
    created: Date;
    deleted: Date;
    isDirty: boolean;

    constructor() {
        this.id = 0;
        this.description = '';
        this.isComplete = false;
        this.isDirty = false;
    }

}
