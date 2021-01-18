.PHONY: build clean

BUILD_DIR=./build
TARGET_NAME=chainlink_vrf
TARGET_PREFIX=$(BUILD_DIR)/$(TARGET_NAME)

build:
	@go build -buildmode=c-archive -o $(TARGET_PREFIX).a

clean:
	@find $(BUILD_DIR) -name '${TARGET_NAME}*' -delete
