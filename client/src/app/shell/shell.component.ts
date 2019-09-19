import { Component, OnInit } from '@angular/core';
import { Task } from '../models/task.model';

import { TaskServiceClient } from '../grpc/TaskServiceClientPb';
import { GetTaskResponse, UpdateTaskRequest, GetAllTasksRequest } from '../grpc/task_pb';
import { Task as PbTask } from '../grpc/task_pb';
import * as grpcWeb from 'grpc-web';

@Component({
  selector: 'app-shell',
  templateUrl: './shell.component.html',
  styleUrls: ['./shell.component.scss']
})
export class ShellComponent implements OnInit {
  private serviceClient: TaskServiceClient;
  private stream;
  private guid: string;

  protected items: Array<Task> = [];

  constructor() {
    this.serviceClient = new TaskServiceClient('http://localhost:8080');
    this.guid = this.genUuid();
  }

  private genUuid(): string {
    return ([1e7] + (-1e3 as any) + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
      (c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))).toString(16)
    );
  }

  ngOnInit() {
    const req = new GetAllTasksRequest();
    req.setSessiontoken(this.guid);

    const stream = this.serviceClient.getAllTasks(req, {});
    stream.on('data', (response: any) => {
      const val = response as PbTask;
      let item: Task;

      // Determine whether its a new push or an update
      const itemToUpdate = this.items.find((v, _) => v.id ===  val.getId());

      // Not so fancy change detection. Hashes would be better
      const newItemUpdated = this.items.find((v, i) => v.id === 0
        && v.description === val.getDescription()
        && v.isComplete === val.getIscomplete());
      const idx = this.items.indexOf(newItemUpdated);

      if ( idx > -1) {
        this.items.splice(idx, 1);
      }

      item = itemToUpdate || new Task();
      item.id = val.getId();
      item.description = val.getDescription();
      item.isComplete = val.getIscomplete();

      if (!itemToUpdate) {
        this.items.push(item);
      }
    });

  }

  addNewItem() {
    this.items.push(new Task());
  }

  onChange(value: string, i: number) {
    this.items[i].isDirty = true;
  }

  onSubmit(event) {
    const update = new UpdateTaskRequest();
    update.setSessiontoken(this.guid);

    this.items.filter( i => i.isDirty === true).forEach((val, idx) => {
        const t = new PbTask();
        t.setId(val.id);
        t.setDescription(val.description);
        t.setIscomplete(val.isComplete);
        update.addTasks(t);
      });

    this.serviceClient.updateTasks(update, null, (error: grpcWeb.Error, response: GetTaskResponse) => {
      if (!error) {
        this.items.filter( i => i.isDirty === true).forEach((val, idx) => {
          val.isDirty = false;
        });
      }
    });
  }

}

