package main

import (
	"./pb"
	"context"
	"flag"
	empty "github.com/golang/protobuf/ptypes/empty"
	"github.com/improbable-eng/grpc-web/go/grpcweb"
	"golang.org/x/net/http2"
	"golang.org/x/net/http2/h2c"
	"google.golang.org/grpc"
	"log"
	"net"
	"net/http"
	"os"
	"strconv"
	"time"
)

type task struct {
	ID          int32
	Description string
	IsComplete  bool
	Created     time.Time
	Deleted     time.Time
}

var tasks = []*task{}

func main() {

	addrGrpc := flag.String("g", "", "GRPC Server bind address e.g. 0.0.0.0:8080 (Required)")
	addrHttp := flag.String("h", "", "HTTP Server bind address e.g. 0.0.0.0:8080 (Required)")

	flag.Parse()

	if *addrGrpc == "" || *addrHttp == "" {
		flag.PrintDefaults()
		os.Exit(1)
	}

	initTasks()

	lis, err := net.Listen("tcp", *addrGrpc)
	if err != nil {
		log.Fatalf("Failed to initialize TCP listener: %v", err)
	}
	defer lis.Close()

	srv := grpc.NewServer()
	grpcWebServer := grpcweb.WrapServer(srv)

	httpServer := &http.Server{
		Addr: *addrHttp,
		Handler: h2c.NewHandler(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			if r.ProtoMajor == 2 {
				grpcWebServer.ServeHTTP(w, r)
			} else {
				w.Header().Set("Access-Control-Allow-Origin", "*")
				w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE")
				w.Header().Set("Access-Control-Allow-Headers", "Accept, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, X-User-Agent, X-Grpc-Web")
				w.Header().Set("grpc-status", "")
				w.Header().Set("grpc-message", "")
				if grpcWebServer.IsGrpcWebRequest(r) {
					grpcWebServer.ServeHTTP(w, r)
				}
			}
		}), &http2.Server{}),
	}

	http2.ConfigureServer(httpServer, nil)

	// Register the implementation for hello server.
	taskservice.RegisterTaskServiceServer(srv, &grpcService{})

	log.Printf("GRPC server listening on  %s", *addrGrpc)
	log.Printf("HTTP server listening on  %s", *addrHttp)
	log.Fatal(httpServer.ListenAndServe())

}

func initTasks() {
	for i := 0; i < 10; i++ {
		n := i + 1
		tasks = append(tasks, &task{ID: int32(n), Description: "Initial Task " + strconv.Itoa(n), IsComplete: false})
	}
}

/////////////////////////////////////////////////////////////
// The following lines contain the implementation for
// the gRPC service "MailService"
/////////////////////////////////////////////////////////////
type grpcService struct {
}

func getGrpcService() *grpcService {
	return &grpcService{}
}

func (s grpcService) GetAllTasks(e *empty.Empty, stream taskservice.TaskService_GetAllTasksServer) error {

	log.Printf("GetAllTasks Executed")

	for i := range tasks {
		stream.Send(&taskservice.Task{
			Id:          tasks[i].ID,
			Description: tasks[i].Description,
			IsComplete:  tasks[i].IsComplete,
		})

		//Delay used to highlight streaming
		time.Sleep(5 * time.Millisecond)
	}

	return nil
}

func (s grpcService) GetTasksSince(ctx context.Context, req *taskservice.GetTasksSinceRequest) (*taskservice.GetTaskResponse, error) {
	response := &taskservice.GetTaskResponse{}
	response.Tasks = make([]*taskservice.Task, len(tasks))

	return response, nil
}

func (s grpcService) UpdateTasks(ctx context.Context, in *taskservice.UpdateTaskRequest) (*empty.Empty, error) {
	log.Printf("AddTask Executed")
	for i := range in.Tasks {
		req := in.Tasks[i]
		if req.Id == 0 {
			//Add item
			next := len(tasks) + 1
			tasks = append(tasks, &task{ID: int32(next), Description: req.Description, IsComplete: req.IsComplete})
		} else {
			//Update existing item
			for j := range tasks {
				if tasks[j].ID == req.Id {
					tasks[j].Description = req.Description
					tasks[j].IsComplete = req.IsComplete
					break
				}
			}
		}
	}

	return &empty.Empty{}, nil
}
