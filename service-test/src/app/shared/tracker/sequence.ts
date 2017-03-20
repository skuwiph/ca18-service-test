export class Sequence {

    constructor( options: {
        id?: number,
        name?: string,
        title?: string
    }) {
        this.id = options.id;
        this.name = options.name;
        this.title = options.title;
    }

    id: number;
    name: string;
    title: string;

}