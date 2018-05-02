package main

func main() {
	bc := NewBlockchain("20178372y471")
	defer bc.db.Close()

	cli := CLI{bc}
	cli.Run()
}
