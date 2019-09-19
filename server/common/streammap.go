package common

import (
	"../pb"
	"sync"
)

type iter func(k string, v *ClientConnection)

// ClientConnection wraps a streming server and has a connected status
type ClientConnection struct {
	conn        taskservice.TaskService_GetAllTasksServer
	isConnected bool
}

// NewClientConnection creates a new connection
func NewClientConnection(connection taskservice.TaskService_GetAllTasksServer) *ClientConnection {
	return &ClientConnection{
		conn:        connection,
		isConnected: true,
	}
}

// Conn returns straming server
func (c *ClientConnection) Conn() taskservice.TaskService_GetAllTasksServer {
	return c.conn
}

// IsConnected returns connected status
func (c *ClientConnection) IsConnected() bool {
	return c.isConnected
}

// SetConnected sets the connected status
func (c *ClientConnection) SetConnected(val bool) {
	c.isConnected = val
}

// StreamMap is a concurrent streaming server map. It uses a unique string as the key
type StreamMap struct {
	sync.RWMutex
	internal map[string]*ClientConnection
}

// NewStreamMap returns a new StreamMap
func NewStreamMap() *StreamMap {
	return &StreamMap{
		internal: make(map[string]*ClientConnection),
	}
}

// Get returns a ClientConnection using a string key value. Its uses a read lock
func (rm *StreamMap) Get(key string) (value *ClientConnection, ok bool) {
	rm.RLock()
	result, ok := rm.internal[key]
	rm.RUnlock()
	return result, ok
}

// Range is meant to be used for performing actions on the entire collection. The map will stay locked(read lock) during the entire call
func (rm *StreamMap) Range(fn iter) {
	rm.RLock()
	for k, v := range rm.internal {
		fn(k, v)
	}
	rm.RUnlock()
}

// Delete will delete a map entry using a key. It uses a read-write lock
func (rm *StreamMap) Delete(key string) {
	rm.Lock()
	delete(rm.internal, key)
	rm.Unlock()
}

// DeleteKeys is used to perform bulk deletes. It uses a read-write lock
func (rm *StreamMap) DeleteKeys(keys *[]string) {
	rm.Lock()
	for i := range *keys {
		delete(rm.internal, (*keys)[i])
	}
	rm.Unlock()
}

// Add an entry to the map
func (rm *StreamMap) Add(key string, value taskservice.TaskService_GetAllTasksServer) {
	rm.Lock()
	rm.internal[key] = NewClientConnection(value)
	rm.Unlock()
}

// ConnectedCount returns the number of entries that have an IsConnected state of true
func (rm *StreamMap) ConnectedCount() int {
	count := 0
	for _, v := range rm.internal {
		if v.IsConnected() {
			count++
		}
	}

	return count
}

// Length return the number of items in the map
func (rm *StreamMap) Length() int {
	rm.Lock()
	l := len(rm.internal)
	rm.Unlock()
	return l
}
