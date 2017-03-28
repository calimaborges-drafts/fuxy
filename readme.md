# fuxy

Proxy to bypass other proxies. Mainly tested agains McAffee Web Gateway.

## Glossary

**bypasser**: client behind proxy
**bouncer** : server outside proxy
 
## About

### Before

```
  [ bypasser ] <-> [ proxy ] <-> [ host ]  
```

### After

```
  [ bypasser ] <-> [ fuxy-client ] <-> [ proxy ] <-> [ fuxy-server ] <-> [ host ]
```

### How does it work?

The main goal is to make the **bypasser** have access to any data from any **host**. In order to do this **fuxy-client** 
and **fuxy-server** establishes a protocol to mask the real data. By doing this we avoid traffic analysis and camouflage
the real host.
 
### The Protocol

**fuxy-server** is a HTTP server so every packet is transferred through a heavy protocol. This situation is not ideal
but we pretend to make it better.

1. **fuxy-client** make a POST to **fuxy-server** with the following json within it's body:

    ```
    { 
        data: <chunk_of_data_base64_encoded>
    }
    ```

2. **fuxy-server** receives the HTTP POST decode the chunk and redirects the chunk to the real host