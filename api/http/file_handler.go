package http

import (
	"fmt"
	"github.com/gorilla/mux"
	"log"
	"net/http"
	"os"
)

// FileHandler represents an HTTP API handler for managing static files.
type FileHandler struct {
	*mux.Router
	Logger *log.Logger
}

func newFileHandler(assetPath string, mw *middleWareService) *FileHandler {
	h := &FileHandler{
		Router: mux.NewRouter(),
		Logger: log.New(os.Stderr, "", log.LstdFlags),
	}
	// h.NotFoundHandler = http.HandlerFunc(notFound)
	handler := mw.static(
		http.FileServer(http.Dir(assetPath)),
		http.HandlerFunc(notFound),
		assetPath)
	h.PathPrefix("/").Handler(handler)
	return h
}

func notFound(w http.ResponseWriter, r *http.Request) {
	fmt.Println("not found func called")
	http.ServeFile(w, r, "/index.html")
}
