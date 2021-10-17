package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os/exec"
)

// 主函数
func main() {
	http.HandleFunc("/data/push", Cors(mainRepoPushed))

	err := http.ListenAndServe(fmt.Sprintf(":%d", 12333), nil)

	if err != nil {
		panic(err.Error())
	} else {
		fmt.Printf("Listen to 12333")
	}
}

func mainRepoPushed(w http.ResponseWriter, req *http.Request) {
	w.WriteHeader(200)
	go handlePush()
}

// CORS
func Cors(f http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Add("Access-Control-Allow-Headers", "Content-Type,AccessToken,X-CSRF-Token, Authorization, Token")
		w.Header().Add("Access-Control-Allow-Credentials", "true")
		w.Header().Add("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE")
		w.Header().Set("content-type", "application/json;charset=UTF-8")
		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusNoContent)
			return
		}
		// 打印 http 日志
		url, _ := json.Marshal(r.URL)
		log.Println("HTTP:", string(url))
		f(w, r)
	}
}

func handlePush() {
	commandOutput, _ := exec.Command("sh", "webhook.sh").Output()
	fmt.Printf(string(commandOutput))
}
