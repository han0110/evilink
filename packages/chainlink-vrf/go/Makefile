.PHONY: clean

PREFIX=./build/chainlink_vrf
TARGET=$(PREFIX).a $(PREFIX).h

all: $(TARGET)

$(TARGET):
	@go build -buildmode=c-archive -o $(PREFIX).a

clean:
	@-rm -f $(TARGET)
