FROM golang:1.27-alpine AS build
ARG VERSION=dev
WORKDIR /src
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 go build -trimpath -ldflags "-s -w -X main.version=${VERSION}" -o /jakarta-votes .

FROM gcr.io/distroless/static-debian12:nonroot
LABEL org.opencontainers.image.source="https://github.com/dmajrekar/civo-kcd-indonesia-2026"
COPY --from=build /jakarta-votes /jakarta-votes
EXPOSE 8080
USER nonroot
ENTRYPOINT ["/jakarta-votes"]
