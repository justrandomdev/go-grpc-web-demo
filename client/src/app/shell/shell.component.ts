import { Component, OnInit } from '@angular/core';
import { Task } from '../models/task.model';

import { TaskServiceClient } from '../grpc/TaskServiceClientPb';
import { GetTaskResponse, UpdateTaskRequest } from '../grpc/task_pb';
import { Task as PbTask } from '../grpc/task_pb';
import * as pb_empty from 'google-protobuf/google/protobuf/empty_pb';
import * as grpcWeb from 'grpc-web';

@Component({
  selector: 'app-shell',
  templateUrl: './shell.component.html',
  styleUrls: ['./shell.component.scss']
})
export class ShellComponent implements OnInit {
  private serviceClient: TaskServiceClient;
  private stream;

  protected items: Array<Task> = [];

  constructor() {
    this.serviceClient = new TaskServiceClient('http://localhost:8080');
  }

  ngOnInit() {
    const stream = this.serviceClient.getAllTasks(new pb_empty.Empty(), {});
    stream.on('data', (response: any) => {
      const val = response as PbTask;
      const item: Task = new Task();
      item.id = val.getId();
      item.description = val.getDescription();
      item.isComplete = val.getIscomplete();
      this.items.push(item);
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

