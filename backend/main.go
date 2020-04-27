package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strconv"

	"github.com/julienschmidt/httprouter"
)

type store struct {
	N                int
	TransactionCount int
	DiscountCount    int
	DiscountCode     string
	DiscountGiven    map[string]bool // tracks whether user has discount
	AdminIDs         map[string]bool // set of user ids that are admins
}

// Initialize test store.
var testStore = store{
	N:                5,
	TransactionCount: 0,
	DiscountCount:    0,
	DiscountCode:     "FzsQR9OB",
	DiscountGiven:    map[string]bool{},
	AdminIDs:         map[string]bool{"admin": true},
}

// intervalGet allows admins to get the transaction interval.
func intervalGet(w http.ResponseWriter, r *http.Request, p httprouter.Params) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	id := p.ByName("id")
	if !testStore.AdminIDs[id] {
		w.WriteHeader(http.StatusForbidden)
		return
	}
	fmt.Fprintf(w, strconv.Itoa(testStore.N))
}

// intervalPost allows admins to set the transaction
// interval at which customers receive a discount.
func intervalPost(w http.ResponseWriter, r *http.Request, p httprouter.Params) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	id := p.ByName("id")
	if !testStore.AdminIDs[id] {
		w.WriteHeader(http.StatusForbidden)
		return
	}
	q := r.URL.Query()
	nString := q.Get("n")
	if nString == "" {
		http.Error(w, "Missing value.", http.StatusBadRequest)
		return
	}
	n, err := strconv.Atoi(nString)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	} else if n <= 0 {
		http.Error(w, "Interval must be greater than 0.", http.StatusBadRequest)
		return
	}
	testStore.N = n
}

// discountGet allows admins to get the discount code at all times
// and customers to get the discount code when they are given one.
func discountGet(w http.ResponseWriter, r *http.Request, p httprouter.Params) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	id := p.ByName("id")
	if testStore.AdminIDs[id] {
		fmt.Fprintf(w, testStore.DiscountCode)
	} else {
		if testStore.TransactionCount != 0 && testStore.TransactionCount%testStore.N == 0 {
			// Do not increment DiscountCount if user already has discount.
			if !testStore.DiscountGiven[id] {
				testStore.DiscountGiven[id] = true
				testStore.DiscountCount++
			}
			fmt.Fprintf(w, testStore.DiscountCode)
		}
	}
}

// discountPost allows admins to set the discount code.
func discountPost(w http.ResponseWriter, r *http.Request, p httprouter.Params) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	id := p.ByName("id")
	if !testStore.AdminIDs[id] {
		w.WriteHeader(http.StatusForbidden)
		return
	}
	q := r.URL.Query()
	code := q.Get("code")
	if code == "" {
		http.Error(w, "Missing value.", http.StatusBadRequest)
		return
	}
	testStore.DiscountCode = code
}

// purchase processes a transaction.
func purchase(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	q := r.URL.Query()
	code := q.Get("code")
	testStore.TransactionCount++
	// Allow users to be given a discount again on the nth transaction.
	if testStore.TransactionCount != 0 && testStore.TransactionCount%testStore.N == 0 {
		testStore.DiscountGiven = map[string]bool{}
	}
	if code == testStore.DiscountCode {
		// do something
	}
}

// report allows admins to get a JSON object containing
// the total count of transactions and discounts given.
func report(w http.ResponseWriter, r *http.Request, p httprouter.Params) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Content-Type", "application/json")
	id := p.ByName("id")
	if !testStore.AdminIDs[id] {
		w.WriteHeader(http.StatusForbidden)
		return
	}
	reportMap := make(map[string]int)
	reportMap["transactionCount"] = testStore.TransactionCount
	reportMap["discountCount"] = testStore.DiscountCount
	reportJSON, err := json.Marshal(reportMap)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	fmt.Fprintf(w, string(reportJSON))
}

func main() {
	router := httprouter.New()
	router.GET("/user/:id/report", report)
	router.GET("/user/:id/interval", intervalGet)
	router.GET("/user/:id/discount", discountGet)
	router.POST("/user/:id/interval", intervalPost)
	router.POST("/user/:id/discount", discountPost)
	router.POST("/user/:id/purchase", purchase)

	log.Fatal(http.ListenAndServe(":8080", router))
}
