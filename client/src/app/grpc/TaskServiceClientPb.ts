/**
 * @fileoverview gRPC-Web generated client stub for taskservice
 * @enhanceable
 * @public
 */

// GENERATED CODE -- DO NOT EDIT!


import * as grpcWeb from 'grpc-web';

import * as google_protobuf_timestamp_pb from 'google-protobuf/google/protobuf/timestamp_pb';
import * as google_protobuf_empty_pb from 'google-protobuf/google/protobuf/empty_pb';

import {
  GetAllTasksRequest,
  Task,
  UpdateTaskRequest} from './task_pb';

export class TaskServiceClient {
  client_: grpcWeb.AbstractClientBase;
  hostname_: string;
  credentials_: null | { [index: string]: string; };
  options_: null | { [index: string]: string; };

  constructor (hostname: string,
               credentials?: null | { [index: string]: string; },
               options?: null | { [index: string]: string; }) {
    if (!options) options = {};
    if (!credentials) credentials = {};
    options['format'] = 'text';

    this.client_ = new grpcWeb.GrpcWebClientBase(options);
    this.hostname_ = hostname;
    this.credentials_ = credentials;
    this.options_ = options;
  }

  methodInfoGetAllTasks = new grpcWeb.AbstractClientBase.MethodInfo(
    Task,
    (request: GetAllTasksRequest) => {
      return request.serializeBinary();
    },
    Task.deserializeBinary
  );

  getAllTasks(
    request: GetAllTasksRequest,
    metadata?: grpcWeb.Metadata) {
    return this.client_.serverStreaming(
      this.hostname_ +
        '/taskservice.TaskService/GetAllTasks',
      request,
      metadata || {},
      this.methodInfoGetAllTasks);
  }

  methodInfoUpdateTasks = new grpcWeb.AbstractClientBase.MethodInfo(
    google_protobuf_empty_pb.Empty,
    (request: UpdateTaskRequest) => {
      return request.serializeBinary();
    },
    google_protobuf_empty_pb.Empty.deserializeBinary
  );

  updateTasks(
    request: UpdateTaskRequest,
    metadata: grpcWeb.Metadata | null,
    callback: (err: grpcWeb.Error,
               response: google_protobuf_empty_pb.Empty) => void) {
    return this.client_.rpcCall(
      this.hostname_ +
        '/taskservice.TaskService/UpdateTasks',
      request,
      metadata || {},
      this.methodInfoUpdateTasks,
      callback);
  }

}

