# Running the ORE Bot stack

## Development
Dev environment is cloud based.

### Infrastructure
* GCloud Kubernetes Cluster (4x Nodes)

### Skaffold
Skaffold YAML file is included for development.  Skaffold offers automated reloading of the Kubernetes project each time changes are saved to the source code.

Stand up the initial project resources.
```shell
skaffold run -p init-deploy-dev
```

Compile the project, build containers, push containers, and run development application.
```shell
skaffold dev -p development
```

