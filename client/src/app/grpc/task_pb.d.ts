import * as jspb from "google-protobuf"

import * as google_protobuf_timestamp_pb from 'google-protobuf/google/protobuf/timestamp_pb';
import * as google_protobuf_empty_pb from 'google-protobuf/google/protobuf/empty_pb';

export class Task extends jspb.Message {
  getId(): number;
  setId(value: number): void;

  getDescription(): string;
  setDescription(value: string): void;

  getIscomplete(): boolean;
  setIscomplete(value: boolean): void;

  getCreated(): google_protobuf_timestamp_pb.Timestamp | undefined;
  setCreated(value?: google_protobuf_timestamp_pb.Timestamp): void;
  hasCreated(): boolean;
  clearCreated(): void;

  getDeleted(): google_protobuf_timestamp_pb.Timestamp | undefined;
  setDeleted(value?: google_protobuf_timestamp_pb.Timestamp): void;
  hasDeleted(): boolean;
  clearDeleted(): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Task.AsObject;
  static toObject(includeInstance: boolean, msg: Task): Task.AsObject;
  static serializeBinaryToWriter(message: Task, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Task;
  static deserializeBinaryFromReader(message: Task, reader: jspb.BinaryReader): Task;
}

export namespace Task {
  export type AsObject = {
    id: number,
    description: string,
    iscomplete: boolean,
    created?: google_protobuf_timestamp_pb.Timestamp.AsObject,
    deleted?: google_protobuf_timestamp_pb.Timestamp.AsObject,
  }
}

export class UpdateTaskRequest extends jspb.Message {
  getTasksList(): Array<Task>;
  setTasksList(value: Array<Task>): void;
  clearTasksList(): void;
  addTasks(value?: Task, index?: number): Task;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): UpdateTaskRequest.AsObject;
  static toObject(includeInstance: boolean, msg: UpdateTaskRequest): UpdateTaskRequest.AsObject;
  static serializeBinaryToWriter(message: UpdateTaskRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): UpdateTaskRequest;
  static deserializeBinaryFromReader(message: UpdateTaskRequest, reader: jspb.BinaryReader): UpdateTaskRequest;
}

export namespace UpdateTaskRequest {
  export type AsObject = {
    tasksList: Array<Task.AsObject>,
  }
}

export class GetTaskResponse extends jspb.Message {
  getTasksList(): Array<Task>;
  setTasksList(value: Array<Task>): void;
  clearTasksList(): void;
  addTasks(value?: Task, index?: number): Task;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetTaskResponse.AsObject;
  static toObject(includeInstance: boolean, msg: GetTaskResponse): GetTaskResponse.AsObject;
  static serializeBinaryToWriter(message: GetTaskResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GetTaskResponse;
  static deserializeBinaryFromReader(message: GetTaskResponse, reader: jspb.BinaryReader): GetTaskResponse;
}

export namespace GetTaskResponse {
  export type AsObject = {
    tasksList: Array<Task.AsObject>,
  }
}

export class GetTasksSinceRequest extends jspb.Message {
  getLastupdated(): google_protobuf_timestamp_pb.Timestamp | undefined;
  setLastupdated(value?: google_protobuf_timestamp_pb.Timestamp): void;
  hasLastupdated(): boolean;
  clearLastupdated(): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetTasksSinceRequest.AsObject;
  static toObject(includeInstance: boolean, msg: GetTasksSinceRequest): GetTasksSinceRequest.AsObject;
  static serializeBinaryToWriter(message: GetTasksSinceRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GetTasksSinceRequest;
  static deserializeBinaryFromReader(message: GetTasksSinceRequest, reader: jspb.BinaryReader): GetTasksSinceRequest;
}

export namespace GetTasksSinceRequest {
  export type AsObject = {
    lastupdated?: google_protobuf_timestamp_pb.Timestamp.AsObject,
  }
}

