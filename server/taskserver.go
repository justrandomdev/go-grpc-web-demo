package main

import (
	"./pb"
	"context"
	"flag"
	empty "github.com/golang/protobuf/ptypes/empty"
	//"github.com/gorilla/websocket"
	"./common"
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

	addrGrpc := flag.String("g", "", "GRPC Server bind address e.g. 0.0.0.0:8060 (Required)")
	addrHTTP := flag.String("h", "", "HTTP Server bind address e.g. 0.0.0.0:8080 (Required)")

	flag.Parse()

	if *addrGrpc == "" || *addrHTTP == "" {
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
		Addr: *addrHTTP,
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
	taskservice.RegisterTaskServiceServer(srv, getGrpcService())

	log.Printf("GRPC server listening on  %s", *addrGrpc)
	log.Printf("HTTP server listening on  %s", *addrHTTP)
	log.Fatal(httpServer.ListenAndServe())

}

func initTasks() {
	for i := 0; i < 5; i++ {
		n := i + 1
		tasks = append(tasks, &task{ID: int32(n), Description: "Initial Task " + strconv.Itoa(n), IsComplete: false})
	}
}

type grpcService struct {
	clients *common.StreamMap
}

func getGrpcService() *grpcService {
	return &grpcService{clients: common.NewStreamMap()}
}

func (s grpcService) GetAllTasks(req *taskservice.GetAllTasksRequest, stream taskservice.TaskService_GetAllTasksServer) error {
	cont := true

	for cont {
		if conn, ok := s.clients.Get(req.SessionToken); !ok {
			s.clients.Add(req.SessionToken, stream)

			log.Printf("%s connected", req.SessionToken)

			for i := range tasks {
				stream.Send(&taskservice.Task{
					Id:          tasks[i].ID,
					Description: tasks[i].Description,
					IsComplete:  tasks[i].IsComplete,
				})
			}

		} else {
			if !conn.IsConnected() {
				// Has disconnected
				s.clients.Delete(req.SessionToken)
				log.Printf("Client deleted")
				cont = false
			}
		}

		time.Sleep(20 * time.Millisecond)
	}

	log.Printf("Exiting!")
	return nil
}

func (s grpcService) markDisconnected(key string) {
	log.Printf("%s disconnected", key)

	if conn, ok := s.clients.Get(key); ok {
		log.Printf("SetConnected=false")
		conn.SetConnected(false)
	}

	log.Printf("%d clients connected", s.clients.ConnectedCount())
}

func (s grpcService) UpdateTasks(ctx context.Context, in *taskservice.UpdateTaskRequest) (*empty.Empty, error) {
	log.Printf("AddTask Executed")
	for i := range in.Tasks {
		req := in.Tasks[i]
		if req.Id == 0 {
			//Add item
			next := len(tasks) + 1
			newTask := &task{ID: int32(next), Description: req.Description, IsComplete: req.IsComplete}
			tasks = append(tasks, newTask)

			s.clients.Range(func(k string, v *common.ClientConnection) {
				req.Id = int32(next)
				err := v.Conn().Send(req)

				if err != nil && i == 0 {
					s.markDisconnected(k)
				}
			})

		} else {
			//Update existing item
			for j := range tasks {
				if tasks[j].ID == req.Id {
					tasks[j].Description = req.Description
					tasks[j].IsComplete = req.IsComplete

					s.clients.Range(func(k string, v *common.ClientConnection) {
						if k != in.SessionToken {
							err := v.Conn().Send(req)

							if err != nil {
								s.markDisconnected(k)
							}
						}
					})
				}
			}
		}
	}

	return &empty.Empty{}, nil
}
